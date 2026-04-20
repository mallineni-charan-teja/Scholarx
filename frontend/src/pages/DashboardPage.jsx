import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

const statusBadge = {
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  revision: "bg-purple-100 text-purple-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [papers, setPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [message, setMessage] = useState("");

  const [uploadForm, setUploadForm] = useState({
    title: "",
    abstract: "",
    keywords: "",
    coAuthors: "",
    paper: null,
  });
  const [reviewForm, setReviewForm] = useState({ paperId: "", comments: "", decision: "approve" });
  const [assignForm, setAssignForm] = useState({ paperId: "", reviewerId: "" });
  const [statusForm, setStatusForm] = useState({ paperId: "", status: "accepted", journalName: "" });

  const loadData = useCallback(async () => {
    const { data } = await api.get("/papers");
    setPapers(data);
    if (user.role === "editor") {
      const reviewersRes = await api.get("/editor/reviewers");
      setReviewers(reviewersRes.data);
    }
  }, [user.role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData().catch(() => console.error("Failed to load dashboard data."));
  }, [loadData]);

  const uploadPaper = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(uploadForm).forEach(([k, v]) => v && formData.append(k, v));
    await api.post("/papers/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setMessage("Paper submitted successfully.");
    setUploadForm({ title: "", abstract: "", keywords: "", coAuthors: "", paper: null });
    await loadData();
  };

  const submitReview = async (e) => {
    e.preventDefault();
    await api.post("/reviews", reviewForm);
    setMessage("Review submitted successfully.");
    setReviewForm({ paperId: "", comments: "", decision: "approve" });
    await loadData();
  };

  const assignReviewer = async (e) => {
    e.preventDefault();
    await api.post("/editor/assign-reviewer", assignForm);
    setMessage("Reviewer assigned.");
    setAssignForm({ paperId: "", reviewerId: "" });
    await loadData();
  };

  const updateStatus = async (e) => {
    e.preventDefault();
    await api.put("/editor/update-status", statusForm);
    setMessage("Paper status updated.");
    setStatusForm({ paperId: "", status: "accepted", journalName: "" });
    await loadData();
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow">
          <div>
            <h1 className="text-2xl font-bold">ScholarX {user.role} Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome, {user.name}</p>
          </div>
          <button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={logout}>Logout</button>
        </header>

        {message && <p className="rounded bg-green-100 px-3 py-2 text-sm text-green-800">{message}</p>}

        {user.role === "researcher" && (
          <form onSubmit={uploadPaper} className="grid gap-3 rounded-xl bg-white p-4 shadow">
            <h2 className="text-lg font-semibold">Submit / Revise Paper</h2>
            <input className="rounded border p-2" placeholder="Title" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} required />
            <textarea className="rounded border p-2" placeholder="Abstract" value={uploadForm.abstract} onChange={(e) => setUploadForm({ ...uploadForm, abstract: e.target.value })} required />
            <input className="rounded border p-2" placeholder="Keywords (comma separated)" value={uploadForm.keywords} onChange={(e) => setUploadForm({ ...uploadForm, keywords: e.target.value })} />
            <input className="rounded border p-2" placeholder="Co-authors (comma separated)" value={uploadForm.coAuthors} onChange={(e) => setUploadForm({ ...uploadForm, coAuthors: e.target.value })} />
            <input className="rounded border p-2" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setUploadForm({ ...uploadForm, paper: e.target.files?.[0] || null })} required />
            <button className="rounded bg-blue-600 p-2 text-white">Upload Paper</button>
          </form>
        )}

        {user.role === "reviewer" && (
          <form onSubmit={submitReview} className="grid gap-3 rounded-xl bg-white p-4 shadow">
            <h2 className="text-lg font-semibold">Submit Review</h2>
            <select className="rounded border p-2" value={reviewForm.paperId} onChange={(e) => setReviewForm({ ...reviewForm, paperId: e.target.value })} required>
              <option value="">Select Paper</option>
              {papers.map((paper) => <option value={paper._id} key={paper._id}>{paper.title}</option>)}
            </select>
            <textarea className="rounded border p-2" placeholder="Review comments" value={reviewForm.comments} onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })} required />
            <select className="rounded border p-2" value={reviewForm.decision} onChange={(e) => setReviewForm({ ...reviewForm, decision: e.target.value })}>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="revise">Revise</option>
            </select>
            <button className="rounded bg-blue-600 p-2 text-white">Submit Review</button>
          </form>
        )}

        {user.role === "editor" && (
          <div className="grid gap-4 md:grid-cols-2">
            <form onSubmit={assignReviewer} className="grid gap-3 rounded-xl bg-white p-4 shadow">
              <h2 className="text-lg font-semibold">Assign Reviewer</h2>
              <select className="rounded border p-2" value={assignForm.paperId} onChange={(e) => setAssignForm({ ...assignForm, paperId: e.target.value })} required>
                <option value="">Select Paper</option>
                {papers.map((paper) => <option value={paper._id} key={paper._id}>{paper.title}</option>)}
              </select>
              <select className="rounded border p-2" value={assignForm.reviewerId} onChange={(e) => setAssignForm({ ...assignForm, reviewerId: e.target.value })} required>
                <option value="">Select Reviewer</option>
                {reviewers.map((reviewer) => <option value={reviewer._id} key={reviewer._id}>{reviewer.name} ({reviewer.email})</option>)}
              </select>
              <button className="rounded bg-blue-600 p-2 text-white">Assign</button>
            </form>

            <form onSubmit={updateStatus} className="grid gap-3 rounded-xl bg-white p-4 shadow">
              <h2 className="text-lg font-semibold">Update Paper Status</h2>
              <select className="rounded border p-2" value={statusForm.paperId} onChange={(e) => setStatusForm({ ...statusForm, paperId: e.target.value })} required>
                <option value="">Select Paper</option>
                {papers.map((paper) => <option value={paper._id} key={paper._id}>{paper.title}</option>)}
              </select>
              <select className="rounded border p-2" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="revision">Revision</option>
                <option value="under_review">Under Review</option>
              </select>
              <input className="rounded border p-2" placeholder="Journal Name (for accepted)" value={statusForm.journalName} onChange={(e) => setStatusForm({ ...statusForm, journalName: e.target.value })} />
              <button className="rounded bg-blue-600 p-2 text-white">Update</button>
            </form>
          </div>
        )}

        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-semibold">Papers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-2">Title</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Submission Date</th>
                  <th className="p-2">File</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper) => (
                  <tr className="border-b" key={paper._id}>
                    <td className="p-2">{paper.title}</td>
                    <td className="p-2">
                      <span className={`rounded-full px-2 py-1 text-xs ${statusBadge[paper.status] || "bg-slate-100 text-slate-700"}`}>
                        {paper.status}
                      </span>
                    </td>
                    <td className="p-2">{new Date(paper.submissionDate).toLocaleDateString()}</td>
                    <td className="p-2">
                      <a className="text-blue-600 underline" href={`${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${paper.fileUrl}`} target="_blank" rel="noreferrer">
                        View File
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;

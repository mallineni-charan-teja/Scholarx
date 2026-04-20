import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import Layout from "../components/Layout";

const statusConfig = {
  submitted: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  under_review: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    ),
  },
  revision: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
      </svg>
    ),
  },
  accepted: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    bg: "bg-secondary",
    text: "text-muted-foreground",
    border: "border-border",
    icon: null,
  };

  return (
    <span
      className={`badge gap-1.5 border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      {status.replace("_", " ")}
    </span>
  );
};

const StatCard = ({ title, value, icon, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
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
  const [reviewForm, setReviewForm] = useState({
    paperId: "",
    comments: "",
    decision: "approve",
  });
  const [assignForm, setAssignForm] = useState({ paperId: "", reviewerId: "" });
  const [statusForm, setStatusForm] = useState({
    paperId: "",
    status: "accepted",
    journalName: "",
  });

  const loadData = useCallback(async () => {
    const { data } = await api.get("/papers");
    setPapers(data);
    if (user.role === "editor") {
      const reviewersRes = await api.get("/editor/reviewers");
      setReviewers(reviewersRes.data);
    }
  }, [user.role]);

  useEffect(() => {
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
    setUploadForm({
      title: "",
      abstract: "",
      keywords: "",
      coAuthors: "",
      paper: null,
    });
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

  const stats = {
    total: papers.length,
    underReview: papers.filter((p) => p.status === "under_review").length,
    accepted: papers.filter((p) => p.status === "accepted").length,
    pending: papers.filter((p) => p.status === "submitted").length,
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {user.name}. Here&apos;s an overview of your{" "}
            {user.role === "researcher"
              ? "submissions"
              : user.role === "reviewer"
                ? "reviews"
                : "editorial tasks"}
            .
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <svg
              className="h-5 w-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-green-800">{message}</p>
            <button
              onClick={() => setMessage("")}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Papers"
            value={stats.total}
            color="primary"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
          <StatCard
            title="Under Review"
            value={stats.underReview}
            color="amber"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            }
          />
          <StatCard
            title="Accepted"
            value={stats.accepted}
            color="green"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            color="purple"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Papers Table */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Papers
                </h2>
                <span className="badge bg-secondary text-secondary-foreground">
                  {papers.length} total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 font-medium text-muted-foreground">
                        Title
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        File
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {papers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-muted-foreground"
                        >
                          <svg
                            className="mx-auto h-12 w-12 text-muted-foreground/50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="mt-2">No papers found</p>
                        </td>
                      </tr>
                    ) : (
                      papers.map((paper) => (
                        <tr key={paper._id} className="group">
                          <td className="py-4">
                            <p className="font-medium text-foreground">
                              {paper.title}
                            </p>
                          </td>
                          <td className="py-4">
                            <StatusBadge status={paper.status} />
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {new Date(paper.submissionDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="py-4">
                            <a
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                              href={`${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${paper.fileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                              Download
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Forms */}
          <div className="space-y-6">
            {/* Researcher: Upload Paper */}
            {user.role === "researcher" && (
              <form onSubmit={uploadPaper} className="card space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Submit Paper
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a new submission
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    className="input-field"
                    placeholder="Paper title"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, title: e.target.value })
                    }
                    required
                  />
                  <textarea
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Abstract"
                    value={uploadForm.abstract}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, abstract: e.target.value })
                    }
                    required
                  />
                  <input
                    className="input-field"
                    placeholder="Keywords (comma separated)"
                    value={uploadForm.keywords}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, keywords: e.target.value })
                    }
                  />
                  <input
                    className="input-field"
                    placeholder="Co-authors (comma separated)"
                    value={uploadForm.coAuthors}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        coAuthors: e.target.value,
                      })
                    }
                  />
                  <div className="relative">
                    <input
                      className="input-field cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          paper: e.target.files?.[0] || null,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary">
                  Upload Paper
                </button>
              </form>
            )}

            {/* Reviewer: Submit Review */}
            {user.role === "reviewer" && (
              <form onSubmit={submitReview} className="card space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <svg
                      className="h-5 w-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Submit Review
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Review an assigned paper
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <select
                    className="input-field"
                    value={reviewForm.paperId}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, paperId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Paper</option>
                    {papers.map((paper) => (
                      <option value={paper._id} key={paper._id}>
                        {paper.title}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Your review comments..."
                    value={reviewForm.comments}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comments: e.target.value })
                    }
                    required
                  />
                  <select
                    className="input-field"
                    value={reviewForm.decision}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, decision: e.target.value })
                    }
                  >
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                    <option value="revise">Revise</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary">
                  Submit Review
                </button>
              </form>
            )}

            {/* Editor Forms */}
            {user.role === "editor" && (
              <>
                <form onSubmit={assignReviewer} className="card space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <svg
                        className="h-5 w-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Assign Reviewer
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Assign paper to reviewer
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <select
                      className="input-field"
                      value={assignForm.paperId}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          paperId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Paper</option>
                      {papers.map((paper) => (
                        <option value={paper._id} key={paper._id}>
                          {paper.title}
                        </option>
                      ))}
                    </select>
                    <select
                      className="input-field"
                      value={assignForm.reviewerId}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          reviewerId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Reviewer</option>
                      {reviewers.map((reviewer) => (
                        <option value={reviewer._id} key={reviewer._id}>
                          {reviewer.name} ({reviewer.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn-primary">
                    Assign
                  </button>
                </form>

                <form onSubmit={updateStatus} className="card space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Update Status
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Change paper status
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <select
                      className="input-field"
                      value={statusForm.paperId}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          paperId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Paper</option>
                      {papers.map((paper) => (
                        <option value={paper._id} key={paper._id}>
                          {paper.title}
                        </option>
                      ))}
                    </select>
                    <select
                      className="input-field"
                      value={statusForm.status}
                      onChange={(e) =>
                        setStatusForm({ ...statusForm, status: e.target.value })
                      }
                    >
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="revision">Revision</option>
                      <option value="under_review">Under Review</option>
                    </select>
                    <input
                      className="input-field"
                      placeholder="Journal Name (for accepted)"
                      value={statusForm.journalName}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          journalName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button type="submit" className="btn-primary">
                    Update Status
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;

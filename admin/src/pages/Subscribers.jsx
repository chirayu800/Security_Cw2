import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Subscribers = ({ token }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem("token");
      if (!authToken) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      const response = await axios.get(backendUrl + "/api/newsletter/all", {
        headers: { token: authToken },
      });

      if (response.data.success) {
        setSubscribers(response.data.subscribers || []);
      } else {
        toast.error(response.data.message || "Failed to fetch subscribers");
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.reload();
      } else {
        toast.error("Failed to fetch subscribers");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [token]);

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Remove subscriber
  const handleRemoveSubscriber = async (subscriberId, email) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from the newsletter?`)) {
      return;
    }

    try {
      setDeletingId(subscriberId);
      const authToken = token || localStorage.getItem("token");
      if (!authToken) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      const response = await axios.delete(backendUrl + `/api/newsletter/delete/${subscriberId}`, {
        headers: { token: authToken },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Subscriber removed successfully");
        // Refresh the list
        fetchSubscribers();
      } else {
        toast.error(response.data.message || "Failed to remove subscriber");
      }
    } catch (error) {
      console.error("Error removing subscriber:", error);
      toast.error(error.response?.data?.message || "Failed to remove subscriber");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Newsletter Subscribers</h1>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-800">{subscribers.length}</span> subscribers
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
      </div>

      {/* Subscribers Table */}
      {filteredSubscribers.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">
            {searchTerm ? "No subscribers found matching your search." : "No subscribers yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscribers.map((subscriber, index) => (
                <tr key={subscriber._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subscriber.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(subscriber.subscribedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subscriber.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {subscriber.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleRemoveSubscriber(subscriber._id, subscriber.email)}
                      disabled={deletingId === subscriber._id}
                      className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Remove subscriber"
                    >
                      {deletingId === subscriber._id ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Export Button */}
      {subscribers.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => {
              const csvContent = [
                ["Email", "Subscribed Date", "Status"],
                ...subscribers.map((sub) => [
                  sub.email,
                  formatDate(sub.subscribedAt),
                  sub.isActive ? "Active" : "Inactive",
                ]),
              ]
                .map((row) => row.join(","))
                .join("\n");

              const blob = new Blob([csvContent], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
              toast.success("Subscribers exported successfully!");
            }}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Export to CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default Subscribers;


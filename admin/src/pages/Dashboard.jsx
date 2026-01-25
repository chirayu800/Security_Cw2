import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ token }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalContacts: 0,
    newContacts: 0,
    readContacts: 0,
    repliedContacts: 0,
  });
  const [recentSubscribers, setRecentSubscribers] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem("token");
      if (!authToken) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      // Fetch subscribers
      const subscribersResponse = await axios.get(backendUrl + "/api/newsletter/all", {
        headers: { token: authToken },
      });

      // Fetch contacts
      const contactsResponse = await axios.get(backendUrl + "/api/contact/all", {
        headers: { token: authToken },
      });

      if (subscribersResponse.data.success && contactsResponse.data.success) {
        const subscribers = subscribersResponse.data.subscribers || [];
        const contacts = contactsResponse.data.contacts || [];

        // Calculate statistics
        const activeSubscribers = subscribers.filter((s) => s.isActive).length;
        const newContacts = contacts.filter((c) => c.status === "new").length;
        const readContacts = contacts.filter((c) => c.status === "read").length;
        const repliedContacts = contacts.filter((c) => c.status === "replied").length;

        setStats({
          totalSubscribers: subscribers.length,
          activeSubscribers,
          totalContacts: contacts.length,
          newContacts,
          readContacts,
          repliedContacts,
        });

        // Get recent subscribers (last 5)
        const recentSubs = subscribers
          .sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt))
          .slice(0, 5);
        setRecentSubscribers(recentSubs);

        // Get recent contacts (last 5)
        const recentConts = contacts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentContacts(recentConts);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        navigate("/");
        window.location.reload();
      } else {
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Subscribers Stats */}
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Newsletter Subscribers</h3>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Subscribers</span>
              <span className="text-2xl font-bold text-gray-800">{stats.totalSubscribers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="text-xl font-semibold text-green-600">{stats.activeSubscribers}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/subscribers")}
            className="mt-4 w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Subscribers
          </button>
        </div>

        {/* Contacts Stats */}
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Contact Messages</h3>
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Messages</span>
              <span className="text-2xl font-bold text-gray-800">{stats.totalContacts}</span>
            </div>
            <div className="flex justify-between gap-4">
              <div>
                <span className="text-gray-600 text-sm">New</span>
                <span className="ml-2 text-lg font-semibold text-blue-600">{stats.newContacts}</span>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Read</span>
                <span className="ml-2 text-lg font-semibold text-yellow-600">{stats.readContacts}</span>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Replied</span>
                <span className="ml-2 text-lg font-semibold text-green-600">{stats.repliedContacts}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/contacts")}
            className="mt-4 w-full px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            View All Contacts
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Quick Actions</h3>
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/add")}
              className="w-full px-4 py-2 text-sm text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Add New Product
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="w-full px-4 py-2 text-sm text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate("/list")}
              className="w-full px-4 py-2 text-sm text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Manage Products
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Subscribers */}
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Subscribers</h3>
            <button
              onClick={() => navigate("/subscribers")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          {recentSubscribers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No subscribers yet</p>
          ) : (
            <div className="space-y-3">
              {recentSubscribers.map((subscriber) => (
                <div
                  key={subscriber._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{subscriber.email}</p>
                    <p className="text-sm text-gray-500">{formatDate(subscriber.subscribedAt)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      subscriber.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {subscriber.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contacts */}
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Contact Messages</h3>
            <button
              onClick={() => navigate("/contacts")}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              View All
            </button>
          </div>
          {recentContacts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No contact messages yet</p>
          ) : (
            <div className="space-y-3">
              {recentContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate("/contacts")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        contact.status === "new"
                          ? "bg-blue-100 text-blue-800"
                          : contact.status === "read"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{contact.subject}</p>
                  <p className="text-xs text-gray-500">{formatDate(contact.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


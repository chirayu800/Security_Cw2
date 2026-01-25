import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Contacts = ({ token }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem("token");
      if (!authToken) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      const response = await axios.get(backendUrl + "/api/contact/all", {
        headers: { token: authToken },
      });

      if (response.data.success) {
        setContacts(response.data.contacts || []);
      } else {
        toast.error(response.data.message || "Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.reload();
      } else {
        toast.error("Failed to fetch contacts");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [token]);

  // Filter contacts based on search term and status
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  // Update contact status
  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      const authToken = token || localStorage.getItem("token");
      if (!authToken) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      const response = await axios.put(
        backendUrl + `/api/contact/status/${contactId}`,
        { status: newStatus },
        { headers: { token: authToken } }
      );

      if (response.data.success) {
        toast.success("Status updated successfully");
        fetchContacts();
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact(response.data.contact);
        }
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Remove contact
  const handleRemoveContact = async (contactId, contactName) => {
    if (!window.confirm(`Are you sure you want to delete the message from ${contactName}?`)) {
      return;
    }

    try {
      setDeletingId(contactId);
      const authToken = token || localStorage.getItem("token");
      if (!authToken) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      const response = await axios.delete(backendUrl + `/api/contact/delete/${contactId}`, {
        headers: { token: authToken },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Contact message deleted successfully");
        fetchContacts();
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact(null);
        }
      } else {
        toast.error(response.data.message || "Failed to delete contact");
      }
    } catch (error) {
      console.error("Error removing contact:", error);
      toast.error(error.response?.data?.message || "Failed to delete contact");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contact Messages</h1>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-800">{contacts.length}</span> messages
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name, email, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {/* Contacts Table */}
      {filteredContacts.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">
            {searchTerm || statusFilter !== "all"
              ? "No contacts found matching your search."
              : "No contact messages yet."}
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              {filteredContacts.map((contact, index) => (
                <tr
                  key={contact._id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedContact(contact)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {contact.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(contact.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contact.status === "new"
                          ? "bg-blue-100 text-blue-800"
                          : contact.status === "read"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveContact(contact._id, contact.name);
                      }}
                      disabled={deletingId === contact._id}
                      className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Delete message"
                    >
                      {deletingId === contact._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedContact(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Contact Message</h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-base text-gray-900">{selectedContact.name}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-base text-gray-900">
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Subject
                </label>
                <p className="text-base text-gray-900">{selectedContact.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Message
                </label>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <p className="text-base text-gray-900">
                  {formatDate(selectedContact.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedContact._id, "new")}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedContact.status === "new"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedContact._id, "read")}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedContact.status === "read"
                        ? "bg-yellow-600 text-white"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    }`}
                  >
                    Read
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedContact._id, "replied")}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedContact.status === "replied"
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    Replied
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;


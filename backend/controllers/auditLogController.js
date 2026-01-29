/**
 * Audit Log Controller
 * Handles viewing and managing audit logs (Admin only).
 */

import auditLogModel from "../models/auditLogModel.js";

/**
 * Get all audit logs with filtering and pagination
 * Admin only
 */
export const getAllAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      eventType,
      status,
      securityLevel,
      userId,
      ipAddress,
      startDate,
      endDate,
      search,
    } = req.query;

    // Build filter object
    const filter = {};

    if (eventType) {
      filter.eventType = eventType;
    }

    if (status) {
      filter.status = status;
    }

    if (securityLevel) {
      filter.securityLevel = securityLevel;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (ipAddress) {
      filter.ipAddress = ipAddress;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
        { requestPath: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get total count
    const total = await auditLogModel.countDocuments(filter);

    // Get audit logs
    const auditLogs = await auditLogModel
      .find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email role')
      .lean();

    res.status(200).json({
      success: true,
      data: auditLogs,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

/**
 * Get a single audit log by ID
 * Admin only
 */
export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const auditLog = await auditLogModel
      .findById(id)
      .populate('userId', 'name email role')
      .lean();

    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    res.status(200).json({
      success: true,
      data: auditLog,
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit log",
      error: error.message,
    });
  }
};

/**
 * Get audit logs statistics
 * Admin only
 */
export const getAuditLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get statistics
    const [
      totalLogs,
      successLogs,
      failureLogs,
      criticalLogs,
      eventTypeStats,
      statusStats,
      securityLevelStats,
    ] = await Promise.all([
      // Total logs
      auditLogModel.countDocuments(dateFilter),
      
      // Success logs
      auditLogModel.countDocuments({ ...dateFilter, status: 'SUCCESS' }),
      
      // Failure logs
      auditLogModel.countDocuments({ ...dateFilter, status: 'FAILURE' }),
      
      // Critical security logs
      auditLogModel.countDocuments({ ...dateFilter, securityLevel: 'CRITICAL' }),
      
      // Event type statistics
      auditLogModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      
      // Status statistics
      auditLogModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      
      // Security level statistics
      auditLogModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$securityLevel', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalLogs,
        success: successLogs,
        failure: failureLogs,
        critical: criticalLogs,
        eventTypeStats,
        statusStats,
        securityLevelStats,
      },
    });
  } catch (error) {
    console.error("Error fetching audit log statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit log statistics",
      error: error.message,
    });
  }
};

/**
 * Get recent critical security events
 * Admin only
 */
export const getCriticalEvents = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const criticalEvents = await auditLogModel
      .find({
        securityLevel: 'CRITICAL',
        status: { $in: ['FAILURE', 'WARNING'] },
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email role')
      .lean();

    res.status(200).json({
      success: true,
      data: criticalEvents,
      count: criticalEvents.length,
    });
  } catch (error) {
    console.error("Error fetching critical events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch critical events",
      error: error.message,
    });
  }
};

/**
 * Delete old audit logs (older than specified days)
 * Admin only - Use with caution
 */
export const deleteOldAuditLogs = async (req, res) => {
  try {
    const { days = 90 } = req.query; // Default: delete logs older than 90 days

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await auditLogModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} audit logs older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting old audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete old audit logs",
      error: error.message,
    });
  }
};

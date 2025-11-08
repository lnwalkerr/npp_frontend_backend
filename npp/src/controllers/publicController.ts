import { Request, Response, NextFunction } from "express";
import news from "../models/news";
import event from "../models/event";
import video from "../models/video";
import leader from "../models/leader";

class PublicController {
  /**
   * @swagger
   * /api/public/content:
   *   get:
   *     tags:
   *       - Public Content
   *     summary: Get combined content (news, events, videos, leaders) with pagination and filters
   *     description: Retrieve paginated content from all entities without authentication
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [news, events, videos, leaders, all]
   *         description: Content type filter (default: all)
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search text (searches in titles, descriptions, names)
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Status filter (for events: Upcoming, Past, Cancelled)
   *       - in: query
   *         name: dateFrom
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter content from this date (YYYY-MM-DD)
   *       - in: query
   *         name: dateTo
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter content to this date (YYYY-MM-DD)
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 12
   *         description: Items per page
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [date, title, views, mixed]
   *           default: mixed
   *         description: Sort by field (mixed = interleaves content types for better UX)
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Sort order
   *     responses:
   *       200:
   *         description: Content fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 totalItems:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   *                 currentPage:
   *                   type: integer
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       type:
   *                         type: string
   *                         enum: [news, event, video, leader]
   *                       title:
   *                         type: string
   *                       description:
   *                         type: string
   *                       date:
   *                         type: string
   *                         format: date-time
   *                       image:
   *                         type: string
   *                       author:
   *                         type: string
   *                       status:
   *                         type: string
   *                       views:
   *                         type: integer
   *                       tags:
   *                         type: array
   *                         items:
   *                           type: string
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  static async getCombinedContent(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        type = 'all',
        search = '',
        status,
        dateFrom,
        dateTo,
        page = 1,
        limit = 12,
        sortBy = 'mixed',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build filters
      const baseFilter: any = { isActive: true }; // Only active content

      // Date filters
      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.$gte = new Date(dateFrom as string);
        if (dateTo) dateFilter.$lte = new Date(dateTo as string);
        baseFilter.created_at = dateFilter;
      }

      // Status filter (for events)
      if (status && type === 'events') {
        (baseFilter as any).status = status;
      }

      // Search filter
      let searchFilter = {};
      if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        searchFilter = {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { name: searchRegex },
            { position: searchRegex }
          ]
        };
      }

      const combinedFilter = { ...baseFilter, ...searchFilter };

      // Prepare sort options
      let sortOptions: any = { created_at: -1 };
      if (sortBy === 'title') {
        sortOptions = { title: sortOrder === 'asc' ? 1 : -1 };
      } else if (sortBy === 'views' && type === 'videos') {
        sortOptions = { views: sortOrder === 'asc' ? 1 : -1 };
      } else if (sortBy === 'date') {
        sortOptions = { created_at: sortOrder === 'asc' ? 1 : -1 };
      }

      // Collect data from all sources based on type filter
      let allData: any[] = [];
      let totalItems = 0;

      const queryPromises: Promise<any[]>[] = [];
      const queryTypes: string[] = [];

      // Build queries based on type filter
      if (type === 'all' || type === 'news') {
        queryPromises.push(
          news.find(combinedFilter)
            .populate({ path: "created_by", select: "firstName lastName" })
            .sort(sortOptions)
        );
        queryTypes.push('news');
      }

      if (type === 'all' || type === 'events') {
        queryPromises.push(
          event.find(combinedFilter)
            .populate({ path: "created_by", select: "firstName lastName" })
            .sort(sortOptions)
        );
        queryTypes.push('event');
      }

      if (type === 'all' || type === 'videos') {
        queryPromises.push(
          video.find(combinedFilter)
            .populate({ path: "created_by", select: "firstName lastName" })
            .sort(sortOptions)
        );
        queryTypes.push('video');
      }

      if (type === 'all' || type === 'leaders') {
        queryPromises.push(
          leader.find(combinedFilter)
            .populate({ path: "created_by", select: "firstName lastName" })
            .sort(sortBy === 'date' ? sortOptions : { order: 1, created_at: -1 })
        );
        queryTypes.push('leader');
      }

      // Execute all queries in parallel
      const results = await Promise.all(queryPromises);

      // Transform and combine data
      results.forEach((result, index) => {
        const contentType = queryTypes[index];
        let transformedData: any[] = [];

        if (contentType === 'news') {
          transformedData = result.map((item: any) => ({
            id: item._id,
            type: 'news',
            title: item.title,
            description: item.description,
            date: item.created_at,
            image: item.image?.url || null,
            author: item.created_by ? `${item.created_by.firstName} ${item.created_by.lastName}` : 'Unknown',
            category: item.type,
            status: 'Published',
            views: item.viewCount || 0
          }));
        } else if (contentType === 'event') {
          transformedData = result.map((item: any) => ({
            id: item._id,
            type: 'event',
            title: item.title,
            description: item.description,
            date: item.date,
            location: item.location,
            image: item.image?.url || null,
            author: item.created_by ? `${item.created_by.firstName} ${item.created_by.lastName}` : 'Unknown',
            status: item.status,
            category: 'Event'
          }));
        } else if (contentType === 'video') {
          transformedData = result.map((item: any) => ({
            id: item._id,
            type: 'video',
            title: item.title,
            description: item.description,
            date: item.created_at,
            videoUrl: item.videoUrl,
            thumbnailUrl: item.thumbnailUrl,
            duration: item.duration,
            image: item.thumbnailUrl,
            author: item.created_by ? `${item.created_by.firstName} ${item.created_by.lastName}` : 'Unknown',
            status: 'Published',
            views: item.views || 0,
            tags: item.tags || []
          }));
        } else if (contentType === 'leader') {
          transformedData = result.map((item: any) => ({
            id: item._id,
            type: 'leader',
            title: item.name,
            description: item.description,
            position: item.position,
            date: item.created_at,
            image: null, // Leaders might not have images in the current model
            author: item.created_by ? `${item.created_by.firstName} ${item.created_by.lastName}` : 'Unknown',
            contactInfo: item.contactInfo,
            status: 'Active',
            order: item.order
          }));
        }

        allData.push(...transformedData);
        totalItems += transformedData.length;
      });

      // Sort combined data
      if (sortBy === 'title') {
        allData.sort((a, b) => {
          const aTitle = a.title || a.name || '';
          const bTitle = b.title || b.name || '';
          return sortOrder === 'asc'
            ? aTitle.localeCompare(bTitle)
            : bTitle.localeCompare(aTitle);
        });
      } else if (sortBy === 'date') {
        // First sort by date
        allData.sort((a, b) => {
          const aDate = new Date(a.date || a.created_at);
          const bDate = new Date(b.date || b.created_at);
          return sortOrder === 'asc'
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        });
      } else if (sortBy === 'mixed') {
        // For mixed/all content, interleave different content types for better UX
        // First sort by date within each type, then interleave types
        const groupedByType = {
          news: allData.filter(item => item.type === 'news').sort((a, b) =>
            sortOrder === 'asc'
              ? new Date(a.date).getTime() - new Date(b.date).getTime()
              : new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          event: allData.filter(item => item.type === 'event').sort((a, b) =>
            sortOrder === 'asc'
              ? new Date(a.date).getTime() - new Date(b.date).getTime()
              : new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          video: allData.filter(item => item.type === 'video').sort((a, b) =>
            sortOrder === 'asc'
              ? new Date(a.date).getTime() - new Date(b.date).getTime()
              : new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          leader: allData.filter(item => item.type === 'leader').sort((a, b) =>
            sortOrder === 'asc'
              ? new Date(a.date).getTime() - new Date(b.date).getTime()
              : new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        };

        // Interleave content types for better user experience
        allData = [];
        const maxLength = Math.max(
          groupedByType.news.length,
          groupedByType.event.length,
          groupedByType.video.length,
          groupedByType.leader.length
        );

        for (let i = 0; i < maxLength; i++) {
          if (groupedByType.news[i]) allData.push(groupedByType.news[i]);
          if (groupedByType.event[i]) allData.push(groupedByType.event[i]);
          if (groupedByType.video[i]) allData.push(groupedByType.video[i]);
          if (groupedByType.leader[i]) allData.push(groupedByType.leader[i]);
        }
      }

      // Apply pagination to combined results
      const paginatedData = allData.slice(skip, skip + limitNum);
      const totalPages = Math.ceil(allData.length / limitNum);

      res.json({
        message: "Content fetched successfully",
        totalItems: allData.length,
        totalPages,
        currentPage: pageNum,
        data: paginatedData,
        filters: {
          type,
          search,
          status,
          dateFrom,
          dateTo,
          sortBy,
          sortOrder
        },
        status_code: 200
      });

    } catch (error) {
      console.error('Error fetching combined content:', error);
      res.status(500).json({
        message: "Internal server error",
        status_code: 500
      });
    }
  }
}

export default PublicController;

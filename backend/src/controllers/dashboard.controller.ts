import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Activity } from '../models/Activity';

export const getDashboardOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userId = req.user._id;

    // 1. Find all accessible projects
    const accessibleProjects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    const projectIds = accessibleProjects.map((p) => p._id);

    // 2. Aggregate tasks for these projects
    const allProjectTasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name color')
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar')
      .sort({ updatedAt: -1 });

    // 3. User's specific assigned tasks
    const myTasks = allProjectTasks.filter((t) =>
      t.assignees.some((a: any) => a._id.toString() === userId.toString())
    );

    const totalProjects = accessibleProjects.length;
    const activeProjects = accessibleProjects.filter((p) => p.status === 'in_progress' || p.status === 'planning').length;
    const myPendingTasks = myTasks.filter((t) => t.status !== 'done').length;
    const myCompletedTasks = myTasks.filter((t) => t.status === 'done').length;

    // 4. Calculate project progress for cards (matching the 3 white cards from reference image)
    const projectProgressList = accessibleProjects.slice(0, 6).map((proj) => {
      const projTasks = allProjectTasks.filter((t) => t.project && (t.project as any)._id.toString() === proj._id.toString());
      const total = projTasks.length;
      const completed = projTasks.filter((t) => t.status === 'done').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Calculate days left if dueDate exists
      let daysLeft: number | null = null;
      if (proj.dueDate) {
        const diffMs = new Date(proj.dueDate).getTime() - new Date().getTime();
        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }

      return {
        _id: proj._id,
        name: proj.name,
        description: proj.description,
        color: proj.color,
        status: proj.status,
        totalTasks: total,
        completedTasks: completed,
        progress,
        dueDate: proj.dueDate,
        daysLeft,
        members: proj.members,
      };
    });

    // 5. Recent Activity across user's projects
    const recentActivity = await Activity.find({ project: { $in: projectIds } })
      .populate('actor', 'name email avatar')
      .populate('task', 'title status')
      .populate('project', 'name color')
      .sort({ createdAt: -1 })
      .limit(10);

    // 6. Analytics: Monthly completed velocity data for the Overview wave chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    
    // Group completed tasks by month
    const monthlyDataMap: Record<string, number> = {};
    months.forEach((m) => {
      monthlyDataMap[m] = 0;
    });

    allProjectTasks.forEach((t) => {
      if (t.completedAt) {
        const m = months[new Date(t.completedAt).getMonth()];
        monthlyDataMap[m] = (monthlyDataMap[m] || 0) + 1;
      }
    });

    const velocityChartData = months.map((month) => ({
      month,
      completed: monthlyDataMap[month] || 0,
      target: Math.max(5, (monthlyDataMap[month] || 0) + 3),
    }));

    // Status breakdown
    const statusDistribution = {
      backlog: allProjectTasks.filter((t) => t.status === 'backlog').length,
      todo: allProjectTasks.filter((t) => t.status === 'todo').length,
      in_progress: allProjectTasks.filter((t) => t.status === 'in_progress').length,
      in_review: allProjectTasks.filter((t) => t.status === 'in_review').length,
      done: allProjectTasks.filter((t) => t.status === 'done').length,
    };

    // Priority breakdown
    const priorityDistribution = {
      low: allProjectTasks.filter((t) => t.priority === 'low').length,
      medium: allProjectTasks.filter((t) => t.priority === 'medium').length,
      high: allProjectTasks.filter((t) => t.priority === 'high').length,
      urgent: allProjectTasks.filter((t) => t.priority === 'urgent').length,
    };

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProjects,
          activeProjects,
          myPendingTasks,
          completedTasks: myCompletedTasks,
          totalTasks: allProjectTasks.length,
        },
        projects: projectProgressList,
        recentTasks: allProjectTasks.slice(0, 8),
        myTasks: myTasks.slice(0, 6),
        recentActivity,
        analytics: {
          velocityChartData,
          statusDistribution,
          priorityDistribution,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

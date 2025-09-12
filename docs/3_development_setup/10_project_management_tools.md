# 10. Project Management Tools - JIRA Integration

## 🎯 **Overview**

This document consolidates all JIRA-related configuration, automation, and project management setup for the SmileFactory Platform. It replaces multiple individual JIRA documentation files with a comprehensive, single-source guide.

## 📋 **JIRA Project Setup**

### **Basic Project Configuration**
- **Project Key**: `SMILE`
- **Project Type**: Software Development
- **Workflow**: Custom workflow with GitHub integration
- **Issue Types**: Epic, Story, Task, Bug, Spike

### **Project Components**
- **Frontend** (P5): Next.js/React development
- **Backend** (P4): Node.js/Express.js development  
- **Database**: PostgreSQL/Prisma development
- **DevOps**: Infrastructure and deployment
- **Documentation**: Technical documentation updates

### **Custom Fields Configuration**
```yaml
Required Custom Fields:
  - Process Flow Type: Select List (Authentication, Profile Creation, etc.)
  - Epic Link: Epic Link field for story grouping
  - Story Points: Number field for estimation
  - Component: Select List (Frontend, Backend, Database, DevOps)
  - GitHub PR Link: URL field for PR tracking
  - GitHub Branch: Text field for branch tracking
  - Deployment Status: Select List (Dev, Staging, Production)
  - Team Assignment: Select List (Frontend Team, Backend Team)
  - Reviewer: User Picker for code review assignment
```

## 🔄 **Workflow Configuration**

### **Issue Workflow States**
1. **📋 To Do**: Ready for development
2. **🔄 In Progress**: Currently being worked on
3. **👀 In Review**: Pull request created, under review
4. **🧪 Testing**: In QA testing phase
5. **✅ Done**: Completed and merged

### **Workflow Transitions**
- **Start Progress**: To Do → In Progress (Developer action)
- **Submit for Review**: In Progress → In Review (PR creation)
- **Approve**: In Review → Testing (Review approval)
- **Complete**: Testing → Done (Merge completion)
- **Reject**: In Review → In Progress (Review rejection)

## 🤖 **GitHub Integration and Automation**

### **Automated JIRA Updates**
```yaml
GitHub Events → JIRA Actions:
  PR Created: 
    - Move ticket to "In Review"
    - Add PR link to ticket
    - Assign reviewer
  
  PR Merged:
    - Move ticket to "Done"
    - Add completion comment
    - Update deployment status
  
  Commit with JIRA ID:
    - Add commit link to ticket
    - Log time if specified (#time 2h)
    - Update progress comments
```

### **Branch Naming Convention**
```bash
# Format: feature/SMILE-XXX-P[4|5]-[component]-[description]
Examples:
✅ feature/SMILE-123-P4-backend-auth-api
✅ feature/SMILE-456-P5-frontend-user-dashboard
✅ feature/SMILE-789-P4-database-schema-update
```

### **Commit Message Format**
```bash
# Format: SMILE-XXX: [description] [optional-commands]
Examples:
SMILE-123: Implement user authentication API
SMILE-456: Add user dashboard components #time 3h
SMILE-789: Update database schema #in-progress
```

## 📊 **Dashboards and Reporting**

### **Team Dashboard Configuration**
```yaml
Dashboard Widgets:
  - Sprint Progress: Current sprint completion status
  - Team Workload: Issues assigned by team member
  - Component Status: Progress by component (Frontend/Backend)
  - Epic Progress: Epic completion tracking
  - Code Review Queue: Issues awaiting review
  - Deployment Pipeline: Deployment status tracking
```

### **Key Performance Indicators (KPIs)**
- **Sprint Velocity**: Story points completed per sprint
- **Cycle Time**: Time from In Progress to Done
- **Code Review Time**: Time spent in review state
- **Deployment Frequency**: Releases per week/month
- **Bug Rate**: Bugs per feature delivered

## 🎯 **Process Flow Integration**

### **Authentication Flow (Epic: SMILE-12)**
```yaml
Epic Structure:
  - SMILE-14: Email/Password Authentication (Backend)
  - SMILE-15: Social Authentication Integration (Backend)
  - SMILE-16: Authentication Method Selection (Frontend)
  - SMILE-17: Authentication State Management (Frontend)
```

### **Profile Creation Flow (Epic: SMILE-13)**
```yaml
Epic Structure:
  - SMILE-18: Profile Type Selection (Backend)
  - SMILE-19: Profile Auto-save Functionality (Backend)
  - SMILE-20: Profile Type Interface (Frontend)
  - SMILE-21: Profile Completion Tracking (Frontend)
```

## 🔧 **Advanced Automation Features**

### **Epic Progress Tracking**
- **Automatic Progress Calculation**: Based on completed stories
- **Epic Status Updates**: Automatic status changes based on story completion
- **Progress Notifications**: Team notifications on epic milestones

### **Story Estimation and Planning**
- **Story Point Estimation**: Required for all stories
- **Sprint Planning**: Automated sprint capacity calculation
- **Velocity Tracking**: Historical velocity for planning

### **Team Assignment Automation**
- **Component-Based Assignment**: Auto-assign based on component
- **Workload Balancing**: Consider current workload in assignments
- **Skill-Based Routing**: Match tasks to team member expertise

## 📈 **Reporting and Analytics**

### **Sprint Reports**
- **Burndown Charts**: Sprint progress visualization
- **Velocity Charts**: Team velocity over time
- **Cumulative Flow**: Work in progress tracking

### **Quality Metrics**
- **Code Review Metrics**: Review time and quality
- **Bug Tracking**: Bug discovery and resolution rates
- **Technical Debt**: Code quality and maintenance tasks

## 🛠️ **Setup Instructions**

### **Phase 1: Basic Configuration (Day 1)**
1. Create JIRA project with key "SMILE"
2. Configure custom fields and workflows
3. Set up project components and issue types
4. Configure team roles and permissions

### **Phase 2: GitHub Integration (Day 2)**
1. Install GitHub for JIRA app
2. Configure repository connections
3. Set up automation rules
4. Test PR creation and updates

### **Phase 3: Dashboards and Reporting (Day 3)**
1. Create team dashboards
2. Configure reporting widgets
3. Set up automated notifications
4. Train team on dashboard usage

### **Phase 4: Advanced Features (Day 4-5)**
1. Configure epic tracking
2. Set up estimation workflows
3. Implement team assignment automation
4. Create custom reports and analytics

## 📚 **Team Training and Adoption**

### **Developer Training**
- **Ticket Creation**: How to create and manage tickets
- **Branch Naming**: Proper branch naming conventions
- **Commit Messages**: Effective commit message format
- **PR Process**: Pull request creation and review

### **Project Manager Training**
- **Sprint Planning**: Using JIRA for sprint management
- **Progress Tracking**: Monitoring team and project progress
- **Reporting**: Generating and interpreting reports
- **Process Optimization**: Continuous improvement practices

## 🔍 **Troubleshooting**

### **Common Issues**
- **JIRA Ticket Not Linking**: Ensure commit message starts with `SMILE-XXX:`
- **Automation Not Working**: Check GitHub-JIRA integration status
- **PR Status Not Updating**: Verify webhook configuration
- **Dashboard Not Loading**: Check permissions and widget configuration

### **Support Resources**
- **JIRA Documentation**: Internal JIRA setup guides
- **GitHub Integration**: GitHub for JIRA app documentation
- **Team Support**: Contact project management team for assistance

---

## 📝 **Maintenance and Updates**

### **Regular Maintenance Tasks**
- **Weekly**: Review automation rules and fix any issues
- **Monthly**: Update dashboards and reports based on team feedback
- **Quarterly**: Review and optimize workflows and processes

### **Continuous Improvement**
- **Team Feedback**: Regular feedback collection on JIRA usage
- **Process Optimization**: Identify and implement process improvements
- **Tool Updates**: Keep JIRA and integrations up to date

---

**Last Updated**: 2024-01-10  
**Maintained By**: Project Management Team  
**Review Cycle**: Monthly

*This document consolidates all JIRA-related setup and configuration for the SmileFactory Platform project management.*

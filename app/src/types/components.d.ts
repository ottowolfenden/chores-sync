declare global {
    type AssignmentList = import("../components/assignment-list").AssignmentList;
    type MdIcon = import("../components/md-icon").MdIcon;
    type StateActions = import("../components/state-actions").StateActions;
    type NumInput = import("../components/num-input").NumInput;
    type SectionNav = import("../components/section-nav").SectionNav;
    type StatusMessage = import("../components/status-message").StatusMessage;

    interface HTMLElementTagNameMap {
        "assignment-list": AssignmentList;
        "md-icon": MdIcon;
        "state-actions": StateActions;
        "num-input": NumInput;
        "section-nav": SectionNav;
        "status-message": StatusMessage;
    }
}

export {};

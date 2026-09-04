declare global {
    type AssignmentsList = import("./src/components/assignments-list").AssignmentsList;
    type CountsList = import("./src/components/counts-list").CountsList;
    type MdIcon = import("./src/components/md-icon").MdIcon;
    type StateActions = import("./src/components/state-actions").StateActions;
    type NumInput = import("./src/components/num-input").NumInput;
    type SectionNav = import("./src/components/section-nav").SectionNav;
    type StatusMessage = import("./src/components/status-message").StatusMessage;
    type TimelineList = import("./src/components/timeline-list").TimelineList;
    type TurnsList = import("./src/components/turns-list").TurnsList;

    interface HTMLElementTagNameMap {
        "assignments-list": AssignmentsList;
        "counts-list": CountsList;
        "md-icon": MdIcon;
        "state-actions": StateActions;
        "num-input": NumInput;
        "section-nav": SectionNav;
        "status-message": StatusMessage;
        "timeline-list": TimelineList;
        "turns-list": TurnsList;
    }
}

export {};

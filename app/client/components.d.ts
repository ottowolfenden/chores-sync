declare global {
    type AssignmentList = import("./src/components/assignment-list").AssignmentList;
    type MdIcon = import("./src/components/md-icon").MdIcon;
    type StateActions = import("./src/components/state-actions").StateActions;
    type NumInput = import("./src/components/num-input").NumInput;
    type SectionNav = import("./src/components/section-nav").SectionNav;
    type StatusMessage = import("./src/components/status-message").StatusMessage;
    type TurnsList = import("./src/components/turns-list").TurnsList;

    interface HTMLElementTagNameMap {
        "assignment-list": AssignmentList;
        "md-icon": MdIcon;
        "state-actions": StateActions;
        "num-input": NumInput;
        "section-nav": SectionNav;
        "status-message": StatusMessage;
        "turns-list": TurnsList;
    }
}

export {};

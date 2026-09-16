import { Cache } from "../classes/cache";
import "../components/members-list";

const section = document.querySelector("section#settings")!;
const membersList = section.querySelector("members-list")!;
const message = section.querySelector("status-message")!;
const stateActions = section.querySelector("state-actions")!;

stateActions.conf = {
    normal: {
        icon: "expand_content",
        label: "Expand all",
        click: () => (membersList.allCollapsed = false)
    },
    active: {
        icon: "collapse_content",
        label: "Collapse all",
        withTransition: false,
        click: () => (membersList.allCollapsed = true)
    }
};

message.elsToHide = [membersList, stateActions];
message.caches = [
    Cache.members,
    Cache.currentMember,
    Cache.turnsToday,
    Cache.assignmentsToday
];

const refreshStateActions = () =>
    (stateActions.state = membersList.allCollapsed ? "normal" : "active");

membersList.addEventListener("collapsetoggle", refreshStateActions);

section.addEventListener("sectionopen", async () => {
    refreshStateActions();
    message.status = "loading";
    const members = await Cache.members.get();
    const currentMember = await Cache.currentMember.get();
    if (!members || !currentMember) message.status = "error";
    else if (members.length == 0) message.status = "empty";
    else {
        message.status = "success";
        membersList.members = members;
        membersList.currentMember = currentMember;
    }
});
section.addEventListener("sectionclose", () => {
    membersList.allCollapsed = true;
    refreshStateActions();
});

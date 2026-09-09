import { html } from "lit";
import { Cache } from "../classes/cache.js";
import { cloneAndSum } from "../functions/assignments.js";
import "../components/assignments-list.js";
import "../components/assignments-state-actions.js";
import "../components/turns-list.js";

const section = document.querySelector("section#today")!;
const turnsDiv = section.querySelector("#turns")!;
const assignmentsDiv = section.querySelector("#assignments")!;

const ui = {
    turns: {
        list: turnsDiv.querySelector("turns-list")!,
        message: turnsDiv.querySelector("status-message")!
    },
    assignments: {
        list: assignmentsDiv.querySelector("assignments-list")!,
        message: assignmentsDiv.querySelector("status-message")!,
        stateActions: assignmentsDiv.querySelector("assignments-state-actions")!
    }
};

window.addEventListener("assignment-added", () => {
    ui.assignments.message.status = "success";
    ui.assignments.stateActions.stateDisabled = false;
});
window.addEventListener(
    "loading-assignment-add",
    () => (ui.assignments.stateActions.stateDisabled = true)
);
window.addEventListener(
    "assignment-add-failed",
    () => (ui.assignments.stateActions.stateDisabled = false)
);

ui.turns.message.elsToHide = [ui.turns.list];
ui.turns.message.caches = ui.assignments.message.caches = [
    Cache.chores,
    Cache.members,
    Cache.turnsToday,
    Cache.assignmentsToday
];
ui.turns.message.messages.empty.content = html`
    No chores have been created.<br />
    Create chores in <a href="#settings">Settings</a>.
`;

ui.assignments.message.elsToHide = [ui.assignments.list, ui.assignments.stateActions];
ui.assignments.message.messages.empty = {
    icon: "celebration",
    content: html`Nothing to do!<br />Assign chores with the plus buttons below.`
};

Object.assign(ui.assignments.stateActions, {
    assignmentsList: ui.assignments.list,
    turnsList: ui.turns.list,
    message: ui.assignments.message
});

let assignments: UiAssignment[] | null;
let turns: UiTurn[] | null;

section.addEventListener("sectionopen", async () => {
    if (!Cache.turnsToday.isCached) ui.turns.message.status = "loading";
    if (!Cache.assignmentsToday.isCached) ui.assignments.message.status = "loading";

    await Promise.all([
        (async () => {
            turns = await Cache.turnsToday.get();
            if (turns == null) ui.turns.message.status = "error";
            else if (turns.length == 0) ui.turns.message.status = "empty";
            else {
                ui.turns.message.status = "success";
                ui.assignments.stateActions.turns = turns;
                ui.turns.list.turns = turns;
            }
        })(),
        (async () => {
            assignments = await Cache.assignmentsToday.get();
            if (assignments == null) ui.assignments.message.status = "error";
            else if (assignments.length == 0) ui.assignments.message.status = "empty";
            else {
                ui.assignments.message.status = "success";
                ui.assignments.stateActions.assignments = assignments;
                ui.assignments.list.assignments = cloneAndSum(assignments);
                setTimeout(() => ui.assignments.list.classList.add("animate"), 150);
            }
        })()
    ]);
});

section.addEventListener("sectionclose", () => {
    if (ui.assignments.stateActions.state == "active") ui.assignments.stateActions.cancel();
    ui.turns.list.allDisabled = false;
    ui.assignments.list.classList.remove("animate");
});

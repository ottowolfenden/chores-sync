import { html } from "lit";
import { replaceAssignments } from "../functions/db-set.js";
import { Cache } from "../classes/cache.js";
import { cloneAndSum } from "../functions/assignments.js";
import "../components/assignments-list.js";
import "../components/turns-list.js";

const section = document.querySelector("section#today")!;

section.addEventListener("open", async () => {
    const turnsDiv = section.querySelector("#turns")!;
    const assignmentsDiv = section.querySelector("#assignments")!;
    const turnsUi = {
        list: turnsDiv.querySelector("turns-list")!,
        message: turnsDiv.querySelector("status-message")!
    };
    const assignmentsUi = {
        list: assignmentsDiv.querySelector("assignments-list")!,
        stateActions: assignmentsDiv.querySelector("state-actions")!,
        message: assignmentsDiv.querySelector("status-message")!
    };

    const enableStateActions = () => (assignmentsUi.stateActions.stateDisabled = false);
    const disableStateActions = () => (assignmentsUi.stateActions.stateDisabled = true);
    const handleNewAssignment = () => {
        assignmentsUi.message.status = "success";
        enableStateActions();
    };

    window.addEventListener("assignment-added", handleNewAssignment);
    window.addEventListener("loading-assignment-add", disableStateActions);
    window.addEventListener("assignment-add-failed", enableStateActions);

    section.addEventListener(
        "close",
        () => {
            if (assignmentsUi.stateActions.state == "active")
                assignmentsUi.stateActions.cancel();
            setAllDisabled(false);
            assignmentsUi.list.classList.remove("animate");
            window.removeEventListener("assignment-added", handleNewAssignment);
            window.removeEventListener("loading-assignment-add", disableStateActions);
            window.removeEventListener("assignment-add-failed", enableStateActions);
        },
        { once: true }
    );

    assignmentsUi.message.elsToHide = [assignmentsUi.list, assignmentsUi.stateActions];
    turnsUi.message.elsToHide = [turnsUi.list];

    assignmentsUi.message.messages.empty = {
        icon: "celebration",
        content: html` Nothing to do!<br />Assign chores with the plus buttons below.`
    };

    turnsUi.message.messages.empty.content = html`
        No chores have been created.<br />Create chores in <a href="#settings">Settings</a>.
    `;

    let assignments: UiAssignment[] | null;
    let turns: UiTurn[] | null;

    const setAllDisabled = (disabled: boolean) =>
        turnsUi.list.querySelectorAll("button").forEach(b => (b.disabled = disabled));

    assignmentsUi.stateActions.conf = {
        normal: {
            icon: "edit",
            label: "Edit",
            click: () => {
                assignmentsUi.list.toggleAttribute("edit-mode", true);
                setAllDisabled(true);
            }
        },
        active: {
            click: async () => {
                assignmentsUi.list.toggleAttribute("edit-mode", false);
                const affectedCaches = [Cache.counts, Cache.todayAssignments];
                affectedCaches.forEach(c => c.invalidate());

                const success = await replaceAssignments(assignmentsUi.list.assignments);
                setAllDisabled(false);
                const newAssignments = cloneAndSum(
                    success ? assignmentsUi.list.assignments : assignments!
                );
                assignmentsUi.list.assignments = newAssignments;
                assignmentsUi.list.requestUpdate();
                affectedCaches.forEach(c => c.refresh());

                if (assignmentsUi.list.assignments.length == 0) {
                    assignmentsUi.stateActions.state = "success";
                    setTimeout(
                        () => (assignmentsUi.message.status = "empty"),
                        assignmentsUi.stateActions.conf.success?.msToShow ??
                            assignmentsUi.stateActions.defaultConf.success.msToShow
                    );
                }
                return success;
            }
        },
        cancel: {
            click: () => {
                assignmentsUi.list.toggleAttribute("edit-mode", false);
                setAllDisabled(false);
                assignmentsUi.list.assignments = cloneAndSum(assignments!);
            }
        },
        loading: {},
        success: {},
        error: {}
    };

    assignmentsUi.message.status = turnsUi.message.status = "loading";

    await Promise.all([
        (async () => {
            turns = await Cache.turns.get();
            if (turns == null) turnsUi.message.status = "error";
            else if (turns.length == 0) turnsUi.message.status = "empty";
            else {
                turnsUi.message.status = "success";
                turnsUi.list.turns = turns;
            }
        })(),
        (async () => {
            assignments = await Cache.todayAssignments.get();
            if (assignments == null) assignmentsUi.message.status = "error";
            else if (assignments.length == 0) assignmentsUi.message.status = "empty";
            else {
                assignmentsUi.message.status = "success";
                assignmentsUi.list.assignments = cloneAndSum(assignments);
                setTimeout(() => assignmentsUi.list.classList.add("animate"), 150);
            }
        })()
    ]);
});

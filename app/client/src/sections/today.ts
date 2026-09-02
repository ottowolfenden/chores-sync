import { html } from "lit";
import { getTodayAssignments, replaceAssignments } from "../functions/db.js";
import { Context } from "../classes/context.js";
import { cloneAndSum } from "../functions/assignments.js";
import { withTransition } from "../functions/element-utils.js";

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

    const hideAssignmentsMessage = () => (assignmentsUi.message.status = "success");

    window.addEventListener("assignment-added", hideAssignmentsMessage);

    section.addEventListener(
        "close",
        () => {
            assignmentsUi.stateActions.cancel();
            setAllDisabled(false);
            assignmentsUi.list.toggleAttribute("data-transition", false);
            window.removeEventListener("assignment-added", hideAssignmentsMessage);
        },
        { once: true }
    );

    assignmentsUi.message.elsToHide = [assignmentsUi.list, assignmentsUi.stateActions];
    turnsUi.message.elsToHide = [turnsUi.list];

    assignmentsUi.message.messages.empty = {
        icon: "celebration",
        text: html` Nothing to do!<br />Assign chores with the plus buttons below.`
    };

    turnsUi.message.messages.empty.text = html`
        No chores have been created.<br />Create chores in <a href="#settings">Settings</a>.
    `;

    let orgAssignments: UiAssignment[] | null;
    let orgTurns: UiTurn[] | null;

    assignmentsUi.message.status = turnsUi.message.status = "loading";

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

                const success = await replaceAssignments(assignmentsUi.list.assignments);
                setAllDisabled(false);
                const newAssignments = cloneAndSum(
                    success ? assignmentsUi.list.assignments : orgAssignments!
                );
                assignmentsUi.list.assignments = newAssignments;
                assignmentsUi.list.requestUpdate();
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
                assignmentsUi.list.assignments = cloneAndSum(orgAssignments!);
            }
        },
        loading: {},
        success: {},
        error: {}
    };

    await Promise.all([
        (async () => {
            orgTurns = await Context.turns;
            if (orgTurns == null) turnsUi.message.status = "error";
            else if (orgTurns.length == 0) turnsUi.message.status = "empty";
            else {
                turnsUi.message.status = "success";
                turnsUi.list.turns = orgTurns;
            }
        })(),
        (async () => {
            orgAssignments = await getTodayAssignments();
            if (orgAssignments == null) assignmentsUi.message.status = "error";
            else if (orgAssignments.length == 0) assignmentsUi.message.status = "empty";
            else {
                assignmentsUi.message.status = "success";
                assignmentsUi.list.assignments = cloneAndSum(orgAssignments);
                withTransition(assignmentsUi.list.querySelector(".assignment"), {
                    after: () => assignmentsUi.list.toggleAttribute("data-transition", true)
                });
            }
        })()
    ]);
});

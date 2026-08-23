import { html } from "lit";
import { getTodayAssignments, replaceAssignments } from "../functions/db.js";
import { Context } from "../classes/context.js";

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

    section.addEventListener(
        "close",
        () => {
            assignmentsUi.stateActions.conf.cancel?.click?.();
            assignmentsUi.stateActions.state = "normal";
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

    const cloneAndSum = (assignmentsList: UiAssignment[]): UiAssignment[] => {
        const map = new Map<string, UiAssignment>();
        assignmentsList.forEach(a => {
            const key = `${a.chosenMember.name}-${a.chore.name}-${a.date}`;
            if (map.has(key)) map.get(key)!.quantity += a.quantity;
            else map.set(key, { ...a });
        });
        return [...map.values()];
    };

    let assignments: UiAssignment[] | null;
    let turns: UiTurn[] | null;

    assignmentsUi.message.status = turnsUi.message.status = "loading";

    await Promise.all([
        (async () => {
            turns = await Context.turns;
            if (turns == null) turnsUi.message.status = "error";
            else if (turns.length == 0) turnsUi.message.status = "empty";
            else {
                turnsUi.message.status = "success";
                turnsUi.list.turns = turns;
            }
        })(),
        (async () => {
            assignments = await getTodayAssignments();
            if (assignments == null) assignmentsUi.message.status = "error";
            else if (assignments.length == 0) assignmentsUi.message.status = "empty";
            else {
                assignmentsUi.message.status = "success";
                assignmentsUi.list.assignments = cloneAndSum(assignments);

                assignmentsUi.stateActions.conf = {
                    normal: {
                        icon: "edit",
                        label: "Edit",
                        click: () => assignmentsUi.list.toggleAttribute("edit-mode", true)
                    },
                    active: {
                        click: async () => {
                            assignmentsUi.list.toggleAttribute("edit-mode", false);

                            const success = await replaceAssignments(
                                assignmentsUi.list.assignments
                            );
                            const newAssignments = cloneAndSum(
                                success ? assignmentsUi.list.assignments : assignments!
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
                            assignmentsUi.list.assignments = cloneAndSum(assignments!);
                        }
                    },
                    loading: {},
                    success: {},
                    error: {}
                };
            }
        })()
    ]);
});

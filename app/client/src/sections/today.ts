import { html } from "lit";
import { DateOnly } from "../classes/date-only.js";
import { getTurns } from "../functions/db.js";

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

    const tempGetAssignments = (): Promise<UiAssignment[] | null> =>
        new Promise(r =>
            setTimeout(
                () => {
                    if (Math.random() < 0.02) r(null);
                    if (Math.random() < 0.02) r([]);
                    r([
                        {
                            id: 1,
                            date: new DateOnly(),
                            quantity: 1,
                            chore: {
                                id: 1,
                                name: "Washing up",
                                isDaily: true,
                                limitPerDay: 1
                            },
                            turnMember: { id: 1, name: "Otto", isActive: true, isAdmin: true },
                            chosenMember: {
                                id: 1,
                                name: "Otto",
                                isActive: true,
                                isAdmin: true
                            }
                        },
                        {
                            id: 2,
                            date: new DateOnly(),
                            quantity: 1,
                            chore: {
                                id: 2,
                                name: "Cooking supper",
                                isDaily: false,
                                limitPerDay: null
                            },
                            turnMember: { id: 1, name: "Otto", isActive: true, isAdmin: true },
                            chosenMember: {
                                id: 3,
                                name: "Ivo",
                                isActive: true,
                                isAdmin: false
                            }
                        },
                        {
                            id: 3,
                            date: new DateOnly(),
                            quantity: 2,
                            chore: {
                                id: 8,
                                name: "Emptying dishwasher",
                                isDaily: false,
                                limitPerDay: null
                            },
                            turnMember: { id: 1, name: "Otto", isActive: true, isAdmin: true },
                            chosenMember: {
                                id: 2,
                                name: "Emily",
                                isActive: true,
                                isAdmin: true
                            }
                        }
                    ]);
                },
                Math.round(Math.random() * 2000)
            )
        );

    const clone = (list: UiAssignment[]) =>
        JSON.parse(JSON.stringify(list), (key, val) =>
            key == "date" ? new DateOnly(val) : val
        );

    const tempSetAssignments = (): Promise<boolean> =>
        new Promise(r =>
            setTimeout(() => r(Math.random() > 0.02), Math.round(Math.random() * 2000))
        );

    let assignments: UiAssignment[] | null;
    let turns: UiTurn[] | null;

    assignmentsUi.message.status = turnsUi.message.status = "loading";

    await Promise.all([
        (async () => {
            assignments = await tempGetAssignments();
            if (assignments == null) assignmentsUi.message.status = "error";
            else if (assignments.length == 0) assignmentsUi.message.status = "empty";
            else {
                assignmentsUi.message.status = "success";
                assignmentsUi.list.assignments = clone(assignments);

                assignmentsUi.stateActions.conf = {
                    normal: {
                        icon: "edit",
                        label: "Edit",
                        click: () => assignmentsUi.list.toggleAttribute("edit-mode", true)
                    },
                    active: {
                        click: async () => {
                            assignmentsUi.list.toggleAttribute("edit-mode", false);

                            const success = await tempSetAssignments();
                            if (success) assignments = clone(assignmentsUi.list.assignments);
                            else assignmentsUi.list.assignments = clone(assignments!);
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
                            assignmentsUi.list.assignments = clone(assignments!);
                        }
                    },
                    loading: {},
                    success: {},
                    error: {}
                };
            }
        })(),
        (async () => {
            turns = await getTurns();
            if (turns == null) turnsUi.message.status = "error";
            else if (turns.length == 0) turnsUi.message.status = "empty";
            else {
                turnsUi.message.status = "success";
                turnsUi.list.turns = turns;
            }
        })()
    ]);
});

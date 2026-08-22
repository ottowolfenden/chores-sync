import { html } from "lit";
import { DateOnly } from "../classes/date-only.js";
import { getTurns } from "../functions/db.js";

const section = document.querySelector("section#today")!;

section.addEventListener("open", async () => {
    const turnsList = section.querySelector("turns-list")!;
    const assignmentList = section.querySelector("assignment-list")!;
    const assignmentStateActions = section.querySelector<StateActions>(
        "#assignments state-actions"
    )!;
    const assignmentsMessage = section.querySelector<StatusMessage>(
        "#assignments status-message"
    )!;
    const turnsMessage = section.querySelector<StatusMessage>("#turns status-message")!;

    assignmentsMessage.elsToHide = [assignmentList, assignmentStateActions];
    turnsMessage.elsToHide = [turnsList];

    assignmentsMessage.messages.empty = {
        icon: "celebration",
        text: html` Nothing to do!<br />Assign chores with the plus buttons below. `
    };
    turnsMessage.messages.empty.text = html`
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

    assignmentsMessage.status = turnsMessage.status = "loading";

    await Promise.all([
        (async () => {
            assignments = await tempGetAssignments();
            if (assignments == null) assignmentsMessage.status = "error";
            else if (assignments.length == 0) assignmentsMessage.status = "empty";
            else {
                assignmentsMessage.status = "success";
                assignmentList.assignments = clone(assignments);

                assignmentStateActions.conf = {
                    normal: {
                        icon: "edit",
                        label: "Edit",
                        click: () => assignmentList.toggleAttribute("edit-mode", true)
                    },
                    active: {
                        click: async () => {
                            assignmentList.toggleAttribute("edit-mode", false);

                            const success = await tempSetAssignments();
                            if (success) assignments = clone(assignmentList.assignments);
                            else assignmentList.assignments = clone(assignments!);
                            if (assignmentList.assignments.length == 0) {
                                assignmentStateActions.state = "success";
                                setTimeout(
                                    () => (assignmentsMessage.status = "empty"),
                                    assignmentStateActions.conf.success?.msToShow ??
                                        assignmentStateActions.defaultConf.success.msToShow
                                );
                            }

                            return success;
                        }
                    },
                    cancel: {
                        click: () => {
                            assignmentList.toggleAttribute("edit-mode", false);
                            assignmentList.assignments = clone(assignments!);
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
            if (turns == null) turnsMessage.status = "error";
            else if (turns.length == 0) turnsMessage.status = "empty";
            else {
                turnsMessage.status = "success";
                turnsList.turns = turns;
            }
        })()
    ]);

    section.addEventListener("close", () => {
        assignmentStateActions.conf.cancel?.click?.();
        assignmentStateActions.state = "normal";
    });
});

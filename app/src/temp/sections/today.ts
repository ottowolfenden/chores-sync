import { html } from "lit";
import { Context } from "../../classes/context.js";
import { DateOnly } from "../../classes/date-only.js";
import { setTexts } from "../../functions/element-utils.js";
import * as Haptics from "../../functions/haptics.js";

const section = document.querySelector("section#today")!;

section.addEventListener("open", async () => {
    const allChoresList = section.querySelector("#all > ul")!;
    const template = allChoresList.querySelector("template")!;
    const assignmentList = section.querySelector("assignment-list")!;
    const assignedStateActions = section.querySelector<StateActions>(
        "#assigned state-actions"
    )!;
    const assignedStatus = section.querySelector<StatusMessage>("#assigned > status-message")!;
    const allStatus = section.querySelector<StatusMessage>("#all > status-message")!;

    assignedStatus.elsToHide = [assignmentList, assignedStateActions];
    allStatus.elsToHide = [allChoresList];

    assignedStatus.messages.empty = {
        icon: "celebration",
        text: html` Nothing to do!<br />Assign chores with the plus buttons below. `
    };
    allStatus.messages.empty.text = html`
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
    let chores: UiChore[] | null;

    assignedStatus.status = allStatus.status = "loading";

    await Promise.all([
        (async () => {
            assignments = await tempGetAssignments();
            if (assignments == null) assignedStatus.status = "error";
            else if (assignments.length == 0) assignedStatus.status = "empty";
            else {
                assignedStatus.status = "success";
                assignmentList.assignments = clone(assignments);

                assignedStateActions.conf = {
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
                                assignedStateActions.state = "success";
                                setTimeout(
                                    () => (assignedStatus.status = "empty"),
                                    assignedStateActions.conf.success?.msToShow ??
                                        assignedStateActions.defaultConf.success.msToShow
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
            chores = await Context.chores;
            if (chores == null) allStatus.status = "error";
            else if (chores.length == 0) allStatus.status = "empty";
            else {
                allStatus.status = "success";
                const newNodes = chores.map(c => {
                    const clone = template.content.cloneNode(true) as DocumentFragment;
                    const li = clone.firstElementChild as HTMLLIElement;
                    const addButton = clone.querySelector("button") as HTMLButtonElement;
                    setTexts(li, {
                        ".chore-name": c.name,
                        ".member-name": "temp"
                    });
                    Haptics.add(addButton);
                    return clone;
                });
                allChoresList.replaceChildren(template, ...newNodes);
            }
        })()
    ]);

    section.addEventListener("close", () => {
        assignedStateActions.conf.cancel?.click?.();
        assignedStateActions.state = "normal";
    });
});

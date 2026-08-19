import { Context } from "../../services/context.js";
import { ElementUtils } from "../../services/element-utils.js";
import { Haptics } from "../../services/haptics.js";
import { Timer } from "../../services/timer.js";

const section = document.querySelector("section#today")!;

section.addEventListener("open", async () => {
    const controller = new AbortController();

    const allChoresList = section.querySelector("#all > ul")!;
    const template = allChoresList.querySelector("template")!;
    const assignmentList = section.querySelector("assignment-list")!;
    const assignedStateActions = section.querySelector<StateActions>(
        "#assigned state-actions"
    )!;
    const allStatus = section.querySelector<StatusMessage>("#all > status-message")!;
    const assignedStatus = section.querySelector<StatusMessage>("#assigned > status-message")!;

    const tempGetAssignments = (): Promise<UiAssignment[] | null> =>
        new Promise(r =>
            setTimeout(
                () => {
                    if (Math.random() < 0.9) r(null);
                    if (Math.random() < 0.4) r([]);
                    r([
                        {
                            id: 1,
                            datetime: new Date(),
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
                            datetime: new Date(),
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
                            datetime: new Date(),
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
                Math.round(Math.random() * 4000)
            )
        );

    const tempSetAssignments = (): Promise<boolean> =>
        new Promise(r =>
            setTimeout(() => r(Math.random() < 0.5), Math.round(Math.random() * 4000))
        );

    allStatus.elsToHide = [allChoresList];
    assignedStatus.elsToHide = [assignmentList, assignedStateActions];

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
                assignmentList.assignments = structuredClone(assignments);

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
                            if (success)
                                assignments = structuredClone(assignmentList.assignments);
                            else assignmentList.assignments = structuredClone(assignments!);
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
                            assignmentList.assignments = structuredClone(assignments!);
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
                    ElementUtils.setTexts(li, {
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

    section.addEventListener("close", () => controller.abort(), { once: true });
});

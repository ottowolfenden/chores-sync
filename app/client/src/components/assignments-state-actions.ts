import { customElement, property } from "lit/decorators.js";
import { StateActions, type Conf, type State } from "./state-actions";
import { Cache, type CacheData } from "../classes/cache";
import { replaceAssignments } from "../functions/db-set";
import { cloneAndSum } from "../functions/assignments";
import { vibrate } from "../functions/haptics";
import { getDateString } from "../functions/date-utils";

@customElement("assignments-state-actions")
export class AssignmentsStateActions extends StateActions {
    protected createRenderRoot = () => this;

    @property({ attribute: false }) assignments!: UiAssignment[];
    @property({ attribute: false }) turns!: UiTurn[];
    @property({ attribute: false }) assignmentsList!: AssignmentsList;
    @property({ attribute: false }) turnsList!: TurnsList;
    @property({ attribute: false }) message!: StatusMessage;
    @property({ attribute: false }) addButton?: HTMLButtonElement;

    @property({ type: String }) date?: string;
    @property({ type: String, reflect: true }) state: State = "normal";
    @property({ type: Object }) conf: Conf = {
        normal: {
            icon: "edit",
            label: "Edit",
            click: () => {
                this.assignmentsList.editMode = this.turnsList.allDisabled = true;
                this.addButton?.toggleAttribute("hidden", true);
            }
        },
        active: {
            click: async () => {
                this.assignmentsList.editMode = false;
                const affectedCaches: CacheData[] = [
                    Cache.counts,
                    Cache.assignmentsToday,
                    ...(this.date && this.date != getDateString() ? [Cache.turnsToday] : [])
                ];
                affectedCaches.forEach(c => c.invalidate());

                const success = await replaceAssignments(
                    this.assignmentsList.assignments,
                    this.date
                );
                vibrate(success);
                this.turnsList.allDisabled = false;
                this.assignmentsList.assignments = cloneAndSum(
                    success ? this.assignmentsList.assignments : this.assignments
                );
                this.assignmentsList.requestUpdate();
                affectedCaches.forEach(c => c.refresh());

                if (this.assignmentsList.assignments.length == 0) {
                    this.state = "success";
                    setTimeout(
                        () => (this.message.status = "empty"),
                        this.conf.success?.msToShow ?? this.defaultConf.success.msToShow
                    );
                }
                return success;
            }
        },
        cancel: {
            click: () => {
                this.assignmentsList.editMode = this.turnsList.allDisabled = false;
                this.addButton?.toggleAttribute("hidden", false);
                this.assignmentsList.assignments = cloneAndSum(this.assignments);
            }
        },
        loading: {},
        success: { finished: () => this.addButton?.toggleAttribute("hidden", false) },
        error: { finished: () => this.addButton?.toggleAttribute("hidden", false) }
    };
}

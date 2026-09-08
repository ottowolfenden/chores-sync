import { customElement, property } from "lit/decorators.js";
import { StateActions, type Conf, type State } from "./state-actions";
import { Cache } from "../classes/cache";
import { replaceAssignments } from "../functions/db-set";
import { cloneAndSum } from "../functions/assignments";

@customElement("assignments-state-actions")
export class AssignmentsStateActions extends StateActions {
    protected createRenderRoot = () => this;

    @property({ type: Array, attribute: false }) assignments!: UiAssignment[];
    @property({ type: Array, attribute: false }) turns!: UiTurn[];
    @property({ type: Object, attribute: false }) assignmentsList!: AssignmentsList;
    @property({ type: Object, attribute: false }) turnsList!: TurnsList;
    @property({ type: Object, attribute: false }) message!: StatusMessage;

    @property({ type: String, reflect: true }) state: State = "normal";
    @property({ type: Object }) conf: Conf = {
        normal: {
            icon: "edit",
            label: "Edit",
            click: () => (this.assignmentsList.editMode = this.turnsList.allDisabled = true)
        },
        active: {
            click: async () => {
                this.assignmentsList.editMode = false;
                const affectedCaches = [Cache.counts, Cache.todayAssignments];
                affectedCaches.forEach(c => c.invalidate());

                const success = await replaceAssignments(this.assignmentsList.assignments);
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
                this.assignmentsList.editMode = false;
                this.turnsList.allDisabled = false;
                this.assignmentsList.assignments = cloneAndSum(this.assignments);
            }
        },
        loading: {},
        success: {},
        error: {}
    };
}

import { Cache } from "../classes/cache";
import "../components/members-list";

const section = document.querySelector("section#settings")!;
const membersList = section.querySelector("members-list")!;
const message = section.querySelector("status-message")!;

message.elsToHide = [membersList];

section.addEventListener("sectionopen", async () => {
    message.status = "loading";
    const members = await Cache.members.get();
    const currentMember = await Cache.currentMember.get();
    if (!members || !currentMember) message.status = "error";
    else if (members.length == 0) message.status = "empty";
    else {
        message.status = "success";
        membersList.members = members;
        membersList.currentMember = currentMember;
    }
});
section.addEventListener("sectionclose", () => console.log("settings closed"));

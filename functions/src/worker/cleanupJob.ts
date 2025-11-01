import {Response} from "express";
import {Firestore} from "firebase-admin/firestore";
import {fetchAllGroups, updateGroupMembership} from "../helpers";
import {groupDetails} from "../types";

const groupIsExpired = (group: groupDetails): boolean => {
  if (group.startTime == null) {
    return false;
  }
  const startTime: Date = group.startTime.toDate();
  const deleteTime = new Date(startTime);
  deleteTime.setHours(deleteTime.getHours() + 1);
  const now = new Date();
  return now >= deleteTime;
};

const updateUsersJoinedGroups = async (db: Firestore, group: groupDetails) => {
  const isJoinEvent = false;
  for (const user of group.participantDetails) {
    await updateGroupMembership(db, isJoinEvent, user, group.id);
  }
};

export const cleanupJob = async (
  db: Firestore,
  res: Response
) => {
  try {
    const groupsSnapshot = (await fetchAllGroups(db)).docs;
    let groupsDeleted = 0;
    for (const groupDoc of groupsSnapshot) {
      const groupData = groupDoc.data() as groupDetails;
      if (groupIsExpired(groupData)) {
        await updateUsersJoinedGroups(db, groupData);
        await db.recursiveDelete(groupDoc.ref);
        groupsDeleted++;
      }
    }
    res.status(200).send(`Cleaned Up ${groupsDeleted} Groups`);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(`Error running cleanup: ${err.message}`);
    } else {
      res.status(500).send(`Error running cleanup: ${JSON.stringify(err)}`);
    }
  }
};

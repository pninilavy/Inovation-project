export function resetLocalData(groupId?: number) {
    if (!groupId) return;
  
    const keysToRemove = [
      `messages_group-${groupId}`,
      `editor_step2_group-${groupId}`,
      `editing_done_group-${groupId}`,
      `step2_final_group-${groupId}`,
      `step2_top_group-${groupId}`,
      `step3_rankings_group-${groupId}`,
      `groupEditor`
    ];
  
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log(`🧹 נתוני לוקאל נמחקו עבור group-${groupId}`);
  }
  
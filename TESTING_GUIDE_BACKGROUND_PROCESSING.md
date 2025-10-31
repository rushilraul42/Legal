# Background Processing Testing Guide

## Prerequisites
1. Backend server running on port 3000
2. Frontend development server running
3. Valid Gemini API key configured
4. Pinecone indexes set up (legal-documents, legal-drafts)

## Test Scenarios

### Scenario 1: Draft Generation with Navigation
**Objective**: Verify draft generation continues when navigating away

**Steps**:
1. Navigate to "Legal Draft" page
2. Fill in the form:
   - Prompt: "Draft a petition for bail in a criminal case"
   - Draft Type: "Petition"
   - Parties: "John Doe (Petitioner), State of XYZ (Respondent)"
   - Court: "High Court"
3. Click "Generate Draft"
4. **Immediately** navigate to "Dashboard" (before generation completes)
5. Observe the background tasks indicator in bottom-right corner
6. Wait 5-10 seconds
7. Navigate back to "Legal Draft" page

**Expected Results**:
- ✅ Task appears in background indicator while processing
- ✅ Background indicator shows "Generating Petition" with status badge
- ✅ When returning to Legal Draft page, the generated draft is displayed
- ✅ Toast notification appears when generation completes
- ✅ Task disappears from background indicator after completion

### Scenario 2: Judgment Analysis with Navigation
**Objective**: Verify analysis continues in background

**Steps**:
1. Navigate to "Judgment Analysis" page
2. Upload a PDF judgment file
3. Click "Analyze Document"
4. **Immediately** navigate to "Case Search" page
5. Observe background tasks indicator
6. Wait for completion
7. Navigate back to "Judgment Analysis" page

**Expected Results**:
- ✅ Task appears in background indicator showing "Analyzing [filename]"
- ✅ Analysis continues running in background
- ✅ When returning to Analysis page, results are displayed
- ✅ Toast notification for completion
- ✅ Task disappears after completion

### Scenario 3: Concurrent Tasks
**Objective**: Verify multiple tasks can run simultaneously

**Steps**:
1. Navigate to "Legal Draft" and start generation
2. Before it completes, navigate to "Judgment Analysis"
3. Start document analysis
4. Navigate to "Dashboard"
5. Observe background tasks indicator

**Expected Results**:
- ✅ Background indicator shows "Background Tasks (2)"
- ✅ Both tasks listed with their respective descriptions
- ✅ Each has its own status badge
- ✅ Both complete successfully
- ✅ Individual toast notifications for each completion

### Scenario 4: Page Refresh During Processing
**Objective**: Verify task persistence across page refresh

**Steps**:
1. Start a draft generation
2. Before completion, refresh the browser (F5 or Ctrl+R)
3. Observe the page after reload

**Expected Results**:
- ✅ Background task is restored from localStorage
- ✅ Task appears in background indicator
- ✅ Task continues processing
- ✅ Results appear when complete

### Scenario 5: Error Handling
**Objective**: Verify proper error tracking and notification

**Steps**:
1. Stop the backend server
2. Navigate to "Legal Draft"
3. Try to generate a draft
4. Observe behavior

**Expected Results**:
- ✅ Task is created and marked as processing
- ✅ Error is caught and task status updates to 'error'
- ✅ Error toast notification appears
- ✅ Task indicator shows error state (if still visible)
- ✅ No application crash or undefined errors

### Scenario 6: Result Restoration
**Objective**: Verify completed results are restored correctly

**Steps**:
1. Start draft generation
2. Navigate away
3. Wait for completion (watch for toast)
4. Navigate to a different page
5. Return to "Legal Draft" page

**Expected Results**:
- ✅ Previously generated draft is still displayed
- ✅ Can download as Word document
- ✅ All sections are present

## Visual Checks

### Background Tasks Indicator
Location: Fixed bottom-right corner

**When Active**:
- Card visible with shadow
- Title: "Background Tasks (N)"
- Clock icon spinning
- List of active tasks with:
  - Task description
  - Status badge (pending/processing)
  - Progress bar (for processing tasks)

**When No Tasks**:
- Component not rendered (invisible)

### Toast Notifications
Check for notifications at these events:
- ✅ "Draft Generated Successfully" - when draft completes
- ✅ "Analysis Complete" - when analysis completes
- ✅ "Generation Failed" - on draft error
- ✅ "Analysis Error" - on analysis error

## Performance Checks

1. **Memory**: 
   - Open browser DevTools → Memory
   - Verify no memory leaks after multiple task completions
   - localStorage should not grow unbounded

2. **Network**:
   - Open DevTools → Network
   - Verify API calls are made once per task
   - No duplicate calls when navigating

3. **Console**:
   - Should be free of errors
   - No "Cannot read property of undefined" errors
   - No infinite loops

## Edge Cases to Test

1. **Rapid Navigation**: Navigate quickly between pages multiple times while task is running
2. **Multiple Refreshes**: Refresh page multiple times during processing
3. **Browser Close/Reopen**: Close browser tab, reopen application
4. **Task Completion While Away**: Let task complete while on different page, then return
5. **Clear localStorage**: Clear browser storage, verify graceful handling

## Debugging Tips

### Check localStorage
```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('background_tasks')));
```

### Monitor Task Updates
```javascript
// Add to BackgroundTasksContext.tsx temporarily
console.log('Tasks updated:', tasks);
```

### Verify Context Provider
Check React DevTools → Components → BackgroundTasksProvider

## Success Criteria

All test scenarios pass with:
- ✅ No console errors
- ✅ Correct visual feedback
- ✅ Proper state management
- ✅ Task persistence working
- ✅ Results correctly restored
- ✅ Error handling graceful
- ✅ No UI freezing or lag
- ✅ Multiple concurrent tasks work

## Known Limitations

1. **Progress Accuracy**: Progress indicators are simulated, not real-time
2. **Task Queue**: No limit on concurrent tasks (could impact performance)
3. **Storage**: localStorage has ~5-10MB limit (many large results could exceed)
4. **Task Cleanup**: Completed tasks persist until manually cleared

## Next Steps After Testing

1. Document any bugs found
2. Test with real backend API (not just mock data)
3. Test with large PDF files (>10MB)
4. Test with slow network conditions (throttle in DevTools)
5. Test on mobile devices/responsive views

import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import SortableItem from "./SortableItem.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { tabsSendMessage } from "../../firefox/FirefoxMV2WebAPIChromeNamespace.js";

export default function App( { initialAddresses, initialSortByUnread, tabIDs, warning } ) {
  const [addresses, setAddresses] = useState(initialAddresses);
  // console.log("passed:", addresses);
  const [sortByUnread, setSortByUnread] = useState(initialSortByUnread);

  return <>
    {warning && <div class="alert alert-warning p-2" role="alert">{warning}</div>}
    <h3 class="mb-1">Reorder your mailboxes</h3>
    <div class="mb-2">
      <input type="checkbox" id="sort-by-unread" checked={sortByUnread} onClick={() => toggleSortByUnread(tabIDs)}/>
      <label style={{"margin-left": "4px", "margin-bottom": "4px"}} for="sort-by-unread">Always Sort by Unread</label>
      <br/>
      <button onClick={() => resetOrder(tabIDs)}>Reset Order/Refresh Mailboxes</button>
    </div>
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={addresses}
        strategy={verticalListSortingStrategy}
        class="m-1"
      >
        {addresses.map(mailbox => <SortableItem key={mailbox} id={mailbox} />)}
      </SortableContext>
    </DndContext>
  </>;
  
  // update addresses array 
  function handleDragEnd(event) {
    const {active, over} = event; // active=from over=to

    if (active.id !== over.id) { // moved to diff location
      setAddresses((addresses) => {
        const activeIndex = addresses.indexOf(active.id);
        const overIndex = addresses.indexOf(over.id);

        const updatedAddresses = arrayMove(addresses, activeIndex, overIndex);
        chrome.storage.sync.set({"addresses": updatedAddresses});

        // toggle on all tabs
        if (tabIDs) {
          tabIDs.forEach((tabID) => {
            const message = {"task": "updateAddresses", "activeIndex": activeIndex, "overIndex": overIndex};
            tabsSendMessage(tabID, message);
          });
        }

        return updatedAddresses;
      });
    }
  }

  function toggleSortByUnread(tabIDs) {
    const checkbox = document.getElementById("sort-by-unread");
    const checked = checkbox.checked;

    if (!checked) { // now disabled
      const confirmed = window.confirm("This will reload all your Yahoo Mail tabs.\nAre you sure you want to disable Always Sort by Unread?");
      if (!confirmed) {
        checkbox.checked = true; // revert back
        return;
      } else { // reload all tabs with no sort by unread
        // remove "&sortOrder=unread" from url
        if (tabIDs) {
          tabIDs.forEach((tabID) => {
            chrome.tabs.get(tabID, (tab) => { // using callback here ig
              const currentUrl = tab.url;
              const newUrl = currentUrl.replace("&sortOrder=unread", "");
              chrome.tabs.update(tabID, {url: newUrl});
            });
          });
        }
      }
    } else { // now enabled
      // tell all tabs to start sort by unread
      if (tabIDs) {
        tabIDs.forEach((tabID) => {
          const message = {"task": "sortByUnread", "sortByUnread": checked};
          tabsSendMessage(tabID, message);
        });
      }
    }
    setSortByUnread(checked); // update UI
  
    chrome.storage.sync.set({"sortByUnread": checked});
    // console.log("checked:", checked);
  }
}
  
function resetOrder(tabIDs) {
  const confirmed = window.confirm("Resetting the order is required to sort newly-connected mailboxes.\nThis will refresh all of your Yahoo Mail tabs.\nAre you sure you want to reset the order back to default?");

  if (confirmed) {
    chrome.storage.sync.remove("addresses"); // reset order

    // reload all tabs
    tabIDs.forEach((tabID) => {
      chrome.tabs.reload(tabID);
    });

    window.close(); // window.location.reload(); breaks drag and drop for some reason
  }
}
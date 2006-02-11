/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Firefox Toolbar Thinger.
 *
 * The Initial Developer of the Original Code is
 *      Dave Townsend <dave.townsend@blueprintit.co.uk>.
 *
 * Portions created by the Initial Developer are Copyright (C) 2004
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK *****
 *
 * $HeadURL$
 * $LastChangedBy$
 * $Date$
 * $Revision$
 *
 */

var thinger = {
	
	service: null,

	init: function(event)
	{
		thinger.service = Components.classes["@blueprintit.co.uk/thinger-service;1"].getService(Components.interfaces.mIThingerService);

		// Listen for things being removed from the toolbar.
		var palette = document.getElementById("palette-box");
		palette.addEventListener("DOMNodeInserted", thinger.itemAdded, false);
		
		// Listen for things being dropped onto the toolbar
		var mypalette = document.getElementById("thinger-palette");
		mypalette.addEventListener("DOMNodeRemoved", thinger.itemRemoved, false);
		
		// Create the custom items.
		mypalette.appendChild(thinger.createCustom("bookmark"));
	},
	
	accept: function(event)
	{
		// Wipe the custom thing.
		var mypalette = document.getElementById("thinger-palette");
		var holder = mypalette.firstchild;
		while (holder)
		{
			thinger.deleteItem(holder.firstChild);
			holder=holder.nextSibling;
		}
				
		// Persist the thing cache.
		thinger.service.persistThings();
	},
	
	deleteItem: function(wrapper)
	{
		var item = gToolbox.palette.getElementsByAttribute("id",wrapper.id.substring(8));
		thinger.service.deleteThing(item[0]);
	},
	
	createCustom: function(type)
	{
		// When items are dragged away their parent row's are deleted. This hbox simulates a row in the main palette.
		var holder = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "hbox");
		holder.className="thinger-holder";
		
		// Creates a new thing and a wrapper for it.
		var newthing = thinger.service.createThing(gToolbox, type).cloneNode(true);
		var wrapper = createWrapper(newthing.id);
		wrapper.setAttribute("flex", 1);
		wrapper.setAttribute("align", "center");
		wrapper.setAttribute("pack", "center");
		wrapper.setAttribute("minheight", "0");
		wrapper.setAttribute("minwidth", "0");
		wrapper.appendChild(newthing);
		cleanUpItemForPalette(newthing, wrapper);
		holder.appendChild(wrapper);
		
		return holder;
	},
	
	itemAdded: function(event)
	{
		if (event.target.id.substring(0,16)=="wrapper-thinger-")
		{
			// Someone dropped a custom item
			if (confirm("Delete?"))
			{
				thinger.deleteItem(event.target);
				
				// We want to delete it. This code is taken from the toolkit code.
				var currentRow = event.target.parentNode;
				currentRow.removeChild(event.target);

				var last = currentRow.lastChild;
				var first = currentRow.firstChild;
				if (first == last)
				{
					// Kill the row.
					currentRow.parentNode.removeChild(currentRow);
					return;
				}

				if (last.localName == "spacer")
				{
					var flex = last.getAttribute("flex");
					last.setAttribute("flex", ++flex);
					// Reflow doesn't happen for some reason.  Trigger it with a hide/show. ICK! -dwh
					last.hidden = true;
					last.hidden = false;
					return;
				}
				else
				{
					// Make a spacer and give it a flex of 1.
					var spacer = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
					                                      "spacer");
					spacer.setAttribute("flex", "1");
					currentRow.appendChild(spacer);
				}
			}
		}
	},
	
	itemRemoved: function(event)
	{
		// The item holder is the last removed so when this is gone we re-create.
		if (event.target.className.substring(0,16)=="thinger-holder")
		{
			var mypalette = document.getElementById("thinger-palette");
			mypalette.appendChild(thinger.createCustom("bookmark"));
		}
	}
}

window.addEventListener("load", thinger.init, false);
window.addEventListener("unload", thinger.accept, false);

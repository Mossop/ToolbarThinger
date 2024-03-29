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
 * Portions created by the Initial Developer are Copyright (C) 2006
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
	oldFinishToolbarCustomization: null,

	setupThingerPalette: function(event)
	{
		window.removeEventListener("load", thinger.setupThingerPalette, false);
		if (gToolboxDocument.defaultView.thinger)
		{
			thinger.setupCustomisation();
			
			thinger.service = Components.classes["@blueprintit.co.uk/thinger-service;1"].getService(Components.interfaces.mIThingerService);
	
			// Listen for things being removed from the toolbar.
			var palette = document.getElementById("palette-box");
			palette.addEventListener("DOMNodeInserted", thinger.paletteItemAdded, false);
			gToolbox.addEventListener("DOMNodeRemoved", thinger.toolboxItemRemoved, false);
			
			// Listen for things being dropped onto the toolbar
			var mypalette = document.getElementById("thinger-palette");
			mypalette.parentNode.hidden = false;
			mypalette.addEventListener("DOMNodeRemoved", thinger.paletteItemRemoved, false);
			gToolbox.addEventListener("DOMNodeInserted", thinger.toolboxItemAdded, false);
			
			var things = gToolboxDocument.defaultView.thinger.getAvailableThings();
			var row = null;
			var spacer = null;
			for (var i = 0; i<things.length; i++)
			{
				if ((i % 4) == 0)
				{
					if (row)
					{
						spacer = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
						                                  "spacer");
						spacer.setAttribute("flex", "0");
						row.appendChild(spacer);
					}
					row = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "hbox");
					mypalette.appendChild(row);
				}
				row.appendChild(thinger.createCustom(things[i]));
			}
	
			spacer = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
			                                  "spacer");
			spacer.setAttribute("flex", "0");
			row.appendChild(spacer);
		}
	},
	
	finishToolbarCustomization: function(event)
	{
		try
		{
			if (gToolboxDocument.defaultView.thinger)
			{
				var palette = document.getElementById("palette-box");
				palette.removeEventListener("DOMNodeInserted", thinger.paletteItemAdded, false);
				gToolbox.removeEventListener("DOMNodeRemoved", thinger.toolboxItemRemoved, false);
				
				var mypalette = document.getElementById("thinger-palette");
				mypalette.removeEventListener("DOMNodeRemoved", thinger.paletteItemRemoved, false);
				gToolbox.removeEventListener("DOMNodeInserted", thinger.toolboxItemAdded, false);
		
				thinger.removeCustomisation();
		
				// Wipe the custom thing.
				var mypalette = document.getElementById("thinger-palette");
				var row = mypalette.firstChild;
				while (row)
				{
					var wrapper = row.firstChild;
					while (wrapper)
					{
						if (wrapper.id.substring(0,16)=="wrapper-thinger-")
							thinger.deleteItem(wrapper);
						wrapper=wrapper.nextSibling;
					}
					row=row.nextSibling;
				}
						
				// Persist the thing cache.
				thinger.service.persistThings();
			}
		}
		catch (e)
		{
			dump(e+"\n");
		}
		thinger.oldFinishToolbarCustomization();
	},
	
	addCustomiser: function(item)
	{
    var button = item.ownerDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "toolbarbutton");
    button.setAttribute("class", "thinger-customise");
    item.parentNode.insertBefore(button, item.nextSibling);
	},
	
	setupCustomisation: function()
	{
    for (var i = 0; i < gToolbox.childNodes.length; ++i)
    {
      var toolbar = getToolbarAt(i);
      if (isCustomizableToolbar(toolbar))
      {
      	var item = toolbar.firstChild;
      	while (item)
        {
        	var nextSibling = item.nextSibling;
          if (item.localName=="toolbarpaletteitem" && item.firstChild.hasAttribute("thingtype"))
          	thinger.addCustomiser(item);

	        item = nextSibling;
        }
      }
    }
	},
	
	removeCustomisation: function()
	{
    for (var i = 0; i < gToolbox.childNodes.length; ++i)
    {
      var toolbar = getToolbarAt(i);
      if (isCustomizableToolbar(toolbar))
      {
      	var item = toolbar.firstChild;
      	while (item)
        {
        	var nextSibling = item.nextSibling;
          if (item.localName=="toolbarbutton" && item.className=="thinger-customise")
          	item.parentNode.removeChild(item);

          item = nextSibling;
        }
      }
    }
	},
	
	deleteItem: function(wrapper)
	{
    var paletteItem = gToolbox.palette.firstChild;
    while (paletteItem)
    {
      if (paletteItem.id == wrapper.firstChild.id)
      	gToolbox.palette.removeChild(paletteItem)

      paletteItem = paletteItem.nextSibling;
    }
		thinger.service.deleteThing(wrapper.firstChild);
	},
	
	createCustom: function(type)
	{
		// Creates a new thing and a wrapper for it.
		var newthing = thinger.service.createThing(gToolbox, type).cloneNode(true);
		var wrapper = createWrapper(newthing.id);
		wrapper.setAttribute("flex", 1);
		wrapper.setAttribute("align", "center");
		wrapper.setAttribute("pack", "center");
		wrapper.setAttribute("minheight", "0");
		wrapper.setAttribute("minwidth", "0");
		try {
			document.adoptNode(newthing);
		} catch (e) { }
		wrapper.appendChild(newthing);
		cleanUpItemForPalette(newthing, wrapper);
		
		return wrapper;
	},
	
	toolboxItemAdded: function(event)
	{
		if (event.target.localName=="toolbarpaletteitem" && event.target.firstChild.hasAttribute("thingtype"))
			thinger.addCustomiser(event.target);
	},
	
	toolboxItemRemoved: function(event)
	{
		if (event.target.localName=="toolbarpaletteitem" && event.target.firstChild.hasAttribute("thingtype"))
		{
			if (event.target.nextSibling.localName=="toolbarbutton" && event.target.nextSibling.className=="thinger-customise")
			{
				event.target.parentNode.removeChild(event.target.nextSibling);
			}
		}
	},
	
	paletteItemAdded: function(event)
	{
		if (event.target.id.substring(0,16)=="wrapper-thinger-")
		{
			// Someone dropped a custom item
		 	var sbs = Components.classes["@mozilla.org/intl/stringbundle;1"]
											.getService(Components.interfaces.nsIStringBundleService);
			var bundle = sbs.createBundle("chrome://thinger/locale/customise.properties");
			var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		                    .getService(Components.interfaces.nsIPromptService);
		  var text = bundle.GetStringFromName("thinger.deleteprompt.description");
		  var keeptext = bundle.GetStringFromName("thinger.keep.label");
		  var deletetext = bundle.GetStringFromName("thinger.delete.label");
		  var result = promptService.confirmEx(window, "Toolbar Thinger", text, 32639+16777216, keeptext, deletetext, null, null, { value: false });
		  
			if (result==1)
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
	
	paletteItemRemoved: function(event)
	{
		// The item holder is the last removed so when this is gone we re-create.
		if (event.target.id.substring(0,16)=="wrapper-thinger-")
		{
			var type = event.target.firstChild.getAttribute("thingtype");
			event.target.parentNode.insertBefore(thinger.createCustom(type), event.target.nextSibling);
			var spacer = event.target.parentNode.lastChild;
			if (spacer.localName=="spacer")
			{
				var flex = spacer.getAttribute("flex");
				spacer.setAttribute("flex", --flex);
			}
		}
	}
}

window.addEventListener("load", thinger.setupThingerPalette, false);

thinger.oldFinishToolbarCustomization = finishToolbarCustomization;
finishToolbarCustomization = thinger.finishToolbarCustomization;

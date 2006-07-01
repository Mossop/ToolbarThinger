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
	
	findNextNode: function(node)
	{
    while (node && !(node.id &&
        node.localName == "toolbaritem" || 
        node.localName == "toolbarbutton" ||
        node.localName == "toolbarseparator" ||
        node.localName == "toolbarspring" ||
        node.localName == "toolbarspacer"))
    	node = node.nextSibling;
  	return node;
	},
	
	getNodeId: function(node)
	{
		if (!node)
			return null;
    else if (node.localName == "toolbarseparator")
      return "separator";
    else if (node.localName == "toolbarspring")
      return "spring";
    else if (node.localName == "toolbarspacer")
      return "spacer";
    else
      return node.id;
	},
	
	init: function(event)
	{
		this.service = Components.classes["@blueprintit.co.uk/thinger-service;1"]
		                         .getService(Components.interfaces.mIThingerService);
		
		var toolboxes = document.getElementsByTagNameNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "toolbox");

		for (var i=0; i<toolboxes.length; i++)
		{
			var toolbox = toolboxes[i];

			try
			{
				this.service.importThings(toolbox);
			}
			catch (e)
			{
				dump(e+"\n");
			}
			var toolbars = toolbox.getElementsByTagName("toolbar");
			for (var i=0; i<toolbars.length; i++)
			{
				// We have to manually add in custom elements to the toolbar.
				var set = toolbars[i].getAttribute("currentset");
				if (set.indexOf("thinger-")>=0)
				{
					var items = set.split(",");
					var pos = 0;
					var node = this.findNextNode(toolbars[i].firstChild);
					var id = this.getNodeId(node);
					while (pos<items.length)
					{
						if (items[pos].substring(0,8) == "thinger-")
						{
							// Found a thinger to insert.
							// append before node
							toolbars[i].insertItem(items[pos], node, null, false);
							pos++;
						}
						else if (node && (id == items[pos]))
						{
							// Found a correctly placed item.
							pos++;
							node = this.findNextNode(node.nextSibling);
							id = this.getNodeId(node);
						}
						else if (!node)
						{
							// End of toolbar, this item must be invalid.
							pos++;
						}
						else
						{
							// No mans land. Seek forward to see if this item is
							// later in the toolbar and if so move to that position.
							// The next loop round will actually decide what to do with
							// the outcome of this search.
							var seek = this.findNextNode(node.nextSibling);
							var seekid = this.getNodeId(seek);
							while (seek && (seekid != items[pos]))
							{
								seek = this.findNextNode(seek.nextSibling);
								seekid = this.getNodeId(seek);
							}
							if (seek)
							{
								node = seek;
								id = seekid;
							}
							else
								pos++;
						}
					}
				}
			}
		}
	}
}

window.addEventListener("load", function(e) { thinger.init(e) }, false);

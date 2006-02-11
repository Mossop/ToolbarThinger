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
	
	init: function(event)
	{
		this.service = Components.classes["@blueprintit.co.uk/thinger-service;1"]
		                         .getService(Components.interfaces.mIThingerService);
		
		var toolboxes = document.getElementsByTagNameNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "toolbox");

		for (var i=0; i<toolboxes.length; i++)
		{
			var toolbox = toolboxes[i];

			dump("calling import\n");
			try
			{
				this.service.importThings(toolbox);
				dump("done import\n");
			}
			catch (e)
			{
				dump(e+"\n");
			}

			var toolbars = toolbox.getElementsByTagName("toolbar");
			for (var i=0; i<toolbars.length; i++)
			{
				// We have to force re-creation of any toolbar that contains a custom element.
				// TODO This could be cleaned up in the future somewhat.
				var set = toolbars[i].getAttribute("currentset");
				if (set.indexOf("thinger-")>=0)
					toolbars[i].currentSet=set;
			}
		}
	}
}

window.addEventListener("load", thinger.init, false);

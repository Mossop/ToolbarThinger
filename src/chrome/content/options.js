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

var args = window.arguments[0].extra;
var settings = window.arguments[0].settings;
var defaults = window.arguments[0].defaults;
var thing = window.arguments[0].thing;

function setup()
{
	if (window.arguments[0].force)
		document.documentElement.buttons="accept";
}

function persistSettings()
{
	var service = Components.classes["@blueprintit.co.uk/thinger-service;1"]
	                        .getService(Components.interfaces.mIThingerService);
	setAttribute("customised", "true");
	service.persistThings();
	try
	{
		thing.update();
	}
	catch (e)
	{
		// Something nasty happened in the thing's init method
		Components.utils.reportError(e);
	}
}

function getAttribute(name, def)
{
  if (settings.hasAttribute(name))
    return settings.getAttribute(name);
    
  if (defaults.hasAttribute(name))
    return defaults.getAttribute(name);
    
  return def;
}

function setAttribute(name, value)
{
	settings.setAttribute(name, value);
}

function getText(name, def)
{
  var node = settings;
  
  if (name)
  {
    node = node.getElementsByTagNameNS("http://users.blueprintit.co.uk/~dave/web/firefox/Thinger", name);
    if (!node || node.length==0)
      return def;
    node = node[0];
  }
  
  var result = "";
  node = node.firstChild;
  while (node)
  {
    if (node.nodeType == Node.TEXT_NODE)
      result += node.nodeValue;

    node = node.nextSibling;
  }
  return result;
}

function setText(name, value)
{
	var node = settings;
	
	if (name)
	{
		node = node.getElementsByTagName(name);
		if (!node || node.length==0)
		{
			node = settings.ownerDocument.createElementNS("http://users.blueprintit.co.uk/~dave/web/firefox/Thinger", name);
			settings.appendChild(node);
		}
		else
			node = node[0];
	}
	
	var sub = node.firstChild;
	while (sub)
	{
		var next = sub.nextSibling;
		if (sub.nodeType == Node.TEXT_NODE)
		{
			node.removeChild(sub);
		}
		sub = next;
	}
	
	node.appendChild(node.ownerDocument.createTextNode(value));
}

window.addEventListener("load", setup, false);

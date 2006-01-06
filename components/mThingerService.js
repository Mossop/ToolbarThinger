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

var mThingerService = {

thingCache: null,
namespace: "http://users.blueprintit.co.uk/~dave/web/firefox/Thinger",

loadFromFile: function(datafile)
{
	var cache = null;
	var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
	                       .createInstance(Components.interfaces.nsIDOMParser);
	try
	{
		var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
		                       .createInstance(Components.interfaces.nsIFileInputStream);
		stream.init(datafile, 1, 0, Components.interfaces.nsIFileInputStream.CLOSE_ON_EOF);
		
		cache = parser.parseFromStream(stream, "UTF8", datafile.fileSize, "text/xml");
		stream.close();
	}
	catch (e)
	{
		dump(e+"\n");
		return false;
	}

	if (!cache)
		return false;

	if (!cache.documentElement)
		return false;
	
	if (cache.documentElement.localName!="thinger")
		return false;
		
	if (cache.documentElement.namespaceURI!=this.namespace)
		return false;

	this.thingCache = cache;
	
	return true;
},

loadThings: function()
{
	this.thingCache=null;
	
	var directoryService = Components.classes["@mozilla.org/file/directory_service;1"]
										               .getService(Components.interfaces.nsIProperties);
	
	var datafile = directoryService.get("ProfD",Components.interfaces.nsIFile);
	datafile.append("thinger.xml");
	if (datafile.exists())
	{
		this.loadFromFile(datafile);
	}
	
	if (!this.thingCache)
	{
		var em = Components.classes["@mozilla.org/extensions/manager;1"]
							         .getService(Components.interfaces.nsIExtensionManager);
		var installLocation = em.getInstallLocation("Thinger@blueprintit.co.uk");
		datafile = installLocation.getItemFile("Thinger@blueprintit.co.uk", "defaults/thinger.xml");
		
		this.loadFromFile(datafile);
	
		this.persistThings();
	}
},

get things()
{
	if (this.thingCache==null)
		this.loadThings();
	return this.thingCache;
},

createToolbarItem: function(palette, thing)
{
	var item = palette.ownerDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
	                                                 "toolbarbutton");
	item.setAttribute("id", "thinger-"+thing.getAttribute("id"));
	item.setAttribute("label", "New Thinger");
	palette.appendChild(item);
	return item;
},

createThing: function(toolbox)
{
	var things = this.things;
	
	var node=toolbox.ownerDocument.location.href;
	if (toolbox.id)
		node+="#"+toolbox.id;

	var items = things.getElementById(node);
	if (!items)
	{
		items = things.createElementNS("http://users.blueprintit.co.uk/~dave/web/firefox/Thinger", "toolbox");
		things.documentElement.appendChild(items);
		items.setAttribute("id", node);
	}
	
	var thing = things.createElementNS("http://users.blueprintit.co.uk/~dave/web/firefox/Thinger", "thing");
	items.appendChild(thing);
	thing.setAttribute("id", (new Date()).getTime());
	thing.setAttribute("type", "button");
	
	return this.createToolbarItem(toolbox.palette, thing);
},

deleteThing: function(item)
{
	var things = this.things;
	
	var id = item.getAttribute("id").substring(8);
	item.parentNode.removeChild(item);
	
	var thing = things.getElementById(id);
	if (thing)
	{
		var items = thing.parentNode;
		items.removeChild(thing);
		if (!items.firstChild)
			items.parentNode.removeChild(items);
	}
},

importThings: function(toolbox)
{
	var things = this.things;
	
	var node=toolbox.ownerDocument.location.href;
	if (toolbox.id)
		node+="#"+toolbox.id;

	var items = things.getElementById(node);
	if (items)
	{
		var thing = items.firstChild;
		while (thing)
		{
			this.createToolbarItem(toolbox.palette, thing);
			thing=thing.nextSibling;
		}
	}
},

persistThings: function()
{
	if (this.thingCache)
	{
		var directoryService = Components.classes["@mozilla.org/file/directory_service;1"]
											               .getService(Components.interfaces.nsIProperties);
		
		var datafile = directoryService.get("ProfD",Components.interfaces.nsIFile);
		datafile.append("thinger.xml");
	
		try
		{
			var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			                       .createInstance(Components.interfaces.nsIFileOutputStream);
			stream.init(datafile, 42, 0700, 0);
			
			var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"]
			                           .createInstance(Components.interfaces.nsIDOMSerializer);
			serializer.serializeToStream(this.thingCache, stream, "UTF8");
			
			stream.flush();
			stream.close();
		}
		catch (e)
		{
			dump(e+"\n");
		}
	}
},

QueryInterface: function(iid)
{
	if (iid.equals(Components.interfaces.mIThingerService)
		|| iid.equals(Components.interfaces.nsISupports))
	{
		return this;
	}
	throw Components.results.NS_ERROR_NO_INTERFACE;
}
}

var initModule =
{
	ServiceCID: Components.ID("{a09169e9-b2e1-4f0d-85da-49a0665bb7d0}"),
	ServiceContractID: "@blueprintit.co.uk/thinger-service;1",
	ServiceName: "Thinger Service",
	
	registerSelf: function (compMgr, fileSpec, location, type)
	{
		compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.registerFactoryLocation(this.ServiceCID,this.ServiceName,this.ServiceContractID,
			fileSpec,location,type);
	},

	unregisterSelf: function (compMgr, fileSpec, location)
	{
		compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.unregisterFactoryLocation(this.ServiceCID,fileSpec);
	},

	getClassObject: function (compMgr, cid, iid)
	{
		if (!cid.equals(this.ServiceCID))
			throw Components.results.NS_ERROR_NO_INTERFACE
		if (!iid.equals(Components.interfaces.nsIFactory))
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		return this.instanceFactory;
	},

	canUnload: function(compMgr)
	{
		return true;
	},

	instanceFactory:
	{
		createInstance: function (outer, iid)
		{
			if (outer != null)
				throw Components.results.NS_ERROR_NO_AGGREGATION;
			return mThingerService.QueryInterface(iid);
		}
	}
}; //Module

function NSGetModule(compMgr, fileSpec)
{
	return initModule;
}

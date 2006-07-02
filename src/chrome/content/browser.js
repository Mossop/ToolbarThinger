function init_browser_things(event)
{
	if (event.target != document)
		return;

	var appinfo = Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULAppInfo);
	var version = appinfo.version;
	
	var vc = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
	                   .getService(Components.interfaces.nsIVersionComparator);
	
	if (vc.compare(version, "2.0a3")>=0)
		thinger.addAvailableThing("search");
	
	if (vc.compare(version, "3.0a1")>=0)
	{
		thinger.addAvailableThing("places-item");
		thinger.addAvailableThing("places-toolbar");
	}
	else
	{
		thinger.addAvailableThing("bookmark-item");
		thinger.addAvailableThing("bookmark-toolbar");
	}
}

window.addEventListener("DOMContentLoaded", init_browser_things, false);

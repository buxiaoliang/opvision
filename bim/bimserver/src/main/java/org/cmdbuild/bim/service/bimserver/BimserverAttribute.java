package org.cmdbuild.bim.service.bimserver;

import org.cmdbuild.bim.model.Attribute;

public abstract class BimserverAttribute implements Attribute {

	private final Object datavalue;
	protected final String name;

	public BimserverAttribute(final String name, final Object datavalue) {
		this.name = name;
		this.datavalue = datavalue;
	}

	protected Object getDatavalue() {
		return datavalue;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public boolean isValid() {
		return datavalue != null;
	}

	@Override
	public String getValue() {
		return datavalue.toString();
	}

	@Override
	public void setValue(final String value) {
		throw new UnsupportedOperationException();
	}
}

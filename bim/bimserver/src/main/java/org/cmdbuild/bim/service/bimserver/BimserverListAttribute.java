package org.cmdbuild.bim.service.bimserver;

import java.util.ArrayList;
import java.util.List;

import org.bimserver.emf.IdEObject;
import org.cmdbuild.bim.model.Attribute;
import org.cmdbuild.bim.service.ListAttribute;
import org.eclipse.emf.common.util.EList;

public class BimserverListAttribute extends BimserverAttribute implements ListAttribute {

	protected BimserverListAttribute(final String name, final EList value) {
		super(name, value);
	}

	@Override
	public List<Attribute> getValues() {
		final EList<Object> datavalues = ((EList<Object>) getDatavalue());
		final List<Attribute> values = new ArrayList<Attribute>();
		for (final Object datavalue : datavalues) {
			if (datavalue instanceof EList) {
				final Attribute attribute = new BimserverListAttribute(name, (EList) datavalue);
				values.add(attribute);
			} else if (datavalue instanceof IdEObject) {
				final Attribute attribute = new BimserverReferenceAttribute(name, (IdEObject) datavalue);
				values.add(attribute);
			} else {
				final Attribute attribute = new BimserverSimpleAttribute(name, datavalue);
				values.add(attribute);
			}
		}
		return values;
	}

}

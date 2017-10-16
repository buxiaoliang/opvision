package org.cmdbuild.logic.data.access.filter.model;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

public class Not extends AbstractElement {

	private final Element element;

	Not(final Element element) {
		this.element = element;
	}

	@Override
	public void accept(final ElementVisitor visitor) {
		visitor.visit(this);
	}

	@Override
	protected boolean doEquals(final Object obj) {
		if (obj == this) {
			return true;
		}
		if (!(obj instanceof Not)) {
			return false;
		}
		final Not other = Not.class.cast(obj);
		return new EqualsBuilder() //
				.append(this.element, other.element) //
				.isEquals();
	}

	@Override
	protected int doHashCode() {
		return new HashCodeBuilder() //
				.append(element) //
				.toHashCode();
	}

}

package org.cmdbuild.dao.query.clause;

import org.cmdbuild.dao.query.clause.alias.Alias;

public interface QueryAttribute {

	void accept(QueryAttributeVisitor visitor);

	Alias getAlias();

	String getName();
}

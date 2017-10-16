package org.cmdbuild.dao.query.clause;

public interface QueryAttributeVisitor {

	void accept(AnyAttribute value);

	void visit(QueryAliasAttribute value);

}

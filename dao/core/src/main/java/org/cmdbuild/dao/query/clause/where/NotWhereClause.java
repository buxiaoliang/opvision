package org.cmdbuild.dao.query.clause.where;

public class NotWhereClause implements WhereClause {

	private final WhereClause clause;

	private NotWhereClause(final WhereClause clause) {
		this.clause = clause;
	}

	@Override
	public void accept(final WhereClauseVisitor visitor) {
		visitor.visit(this);
	}

	public WhereClause getClause() {
		return clause;
	}

	public static WhereClause not(final WhereClause clause) {
		return new NotWhereClause(clause);
	}

}

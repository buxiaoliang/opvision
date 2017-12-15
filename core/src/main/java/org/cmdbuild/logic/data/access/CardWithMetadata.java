package org.cmdbuild.logic.data.access;

import java.util.Map;

import org.cmdbuild.model.data.Card;

public class CardWithMetadata extends Card {

	private final Map<String, String> metadata;

	public CardWithMetadata(final Card delegate, final Map<String, String> metadata) {
		super(builder(delegate));
		this.metadata = metadata;
	}

	private static Builder builder(final Card delegate) {
		final Builder builder = Card.newInstance();
		return (delegate == null) ? builder : builder.clone(delegate);
	}

	public Map<String, String> getMetadata() {
		return metadata;
	}

}
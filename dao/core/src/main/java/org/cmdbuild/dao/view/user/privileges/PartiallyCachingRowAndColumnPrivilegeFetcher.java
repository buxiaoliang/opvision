package org.cmdbuild.dao.view.user.privileges;

import static com.google.common.base.Preconditions.checkNotNull;
import java.util.Map;

import org.cmdbuild.dao.entrytype.CMEntryType;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.apache.commons.lang3.tuple.Pair;
import org.cmdbuild.dao.entry.CMCard;

public class PartiallyCachingRowAndColumnPrivilegeFetcher extends ForwardingRowAndColumnPrivilegeFetcher {

	private final RowAndColumnPrivilegeFetcher delegate;
	private final LoadingCache<CMEntryType, Map<String, String>> cache1 = CacheBuilder.newBuilder().build(new CacheLoader<CMEntryType, Map<String, String>>() {

		@Override
		public Map<String, String> load(CMEntryType key) throws Exception {
			return delegate().fetchAttributesPrivilegesFor(key);
		}
	});
	private final LoadingCache<Pair<CMEntryType, CMCard>, Map<String, String>> cache2 = CacheBuilder.newBuilder().build(new CacheLoader<Pair<CMEntryType, CMCard>, Map<String, String>>() {

		@Override
		public Map<String, String> load(Pair<CMEntryType, CMCard> key) throws Exception {
			return delegate().fetchAttributesPrivilegesFor(key.getLeft(), key.getRight());
		}
	});

	public PartiallyCachingRowAndColumnPrivilegeFetcher(RowAndColumnPrivilegeFetcher delegate) {
		checkNotNull(delegate);
		this.delegate = delegate;
	}

	@Override
	protected RowAndColumnPrivilegeFetcher delegate() {
		return delegate;
	}

	@Override
	public Map<String, String> fetchAttributesPrivilegesFor(CMEntryType entryType) {
		return cache1.getUnchecked(entryType);
	}

	@Override
	public Map<String, String> fetchAttributesPrivilegesFor(CMEntryType entryType, CMCard card) {
		return cache2.getUnchecked(Pair.of(entryType, card));
	}

}

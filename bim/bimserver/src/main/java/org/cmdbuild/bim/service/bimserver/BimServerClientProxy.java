package org.cmdbuild.bim.service.bimserver;

import org.bimserver.client.BimServerClient;
import org.bimserver.client.json.JsonBimServerClientFactory;
import org.bimserver.shared.UsernamePasswordAuthenticationInfo;
import org.cmdbuild.bim.logging.LoggingSupport;
import org.slf4j.Logger;

public class BimServerClientProxy {

	private static final Logger logger = LoggingSupport.logger;

	BimServerClient client;
	boolean connectionStatus;

	boolean connect(final BimserverConfiguration configuration) {
		if (configuration.isEnabled()) {
			if (isConnected()) {
				connectionStatus = true;
			} else {
				try {
					final JsonBimServerClientFactory factory = new JsonBimServerClientFactory(configuration.getUrl());
					client = factory.create(new UsernamePasswordAuthenticationInfo(configuration.getUsername(),
							configuration.getPassword()));
					connectionStatus = true;
				} catch (final Throwable t) {
					connectionStatus = false;
					logger.warn("Connection to BimServer failed", t);
				}
			}
		} else {
			connectionStatus = false;
		}
		return connectionStatus;
	}

	public boolean isConnected() {
		boolean pingSuccess = false;
		if (connectionStatus) {
			try {
				pingSuccess = client.getBimServerAuthInterface().isLoggedIn();
			} catch (final Throwable t) {
			}
		}
		return pingSuccess;
	}

}

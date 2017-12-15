package org.cmdbuild.services.event;

public interface ObserverCollector {

	interface IdentifiableObserver extends Observer {

		String getIdentifier();

	}

	/**
	 * add task (?) to observer collector
	 *
	 * @param element
	 */
	void add(IdentifiableObserver element);

	/**
	 * remove task (?) from observer collector<br>
	 * removal is done by key, based on element.getIdentifier()
	 *
	 * @param element
	 */
	void remove(IdentifiableObserver element);

	/**
	 * return a single observer that wrap all observers in this collector;
	 * useful for execution of everything as a single unit
	 *
	 * @return a single observer
	 */
	public Observer allInOneObserver();

}

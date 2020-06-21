// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './ReceiveNavigation.scss';

import AttentionIcon from '../../../assets/images/attention-modern.inline.svg';
import ReceiveNavButton from './ReceiveNavButton';
import type {
  $npm$ReactIntl$IntlFormat,
} from 'react-intl';
import { addressGroupName, addressSubgroupName, addressGroupsTooltip, addressFilter, AddressSubgroup } from '../../../types/AddressFilterTypes';
import Accordion from '../../widgets/Accordion';
import InfoIcon from '../../../assets/images/attention-big-light.inline.svg';

import type { AddressTypeName, AddressFilterKind } from '../../../types/AddressFilterTypes';
import classNames from 'classnames';
import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';

export type Props = {|
  +setFilter: AddressFilterKind => void,
  +activeFilter: AddressFilterKind,
  +addressStores: Array<{|
    +isActiveStore: boolean,
    +isHidden: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
    +validFilters: Array<AddressFilterKind>,
    +wasExecuted: boolean,
  |}>;
|};

@observer
export default class ReceiveNavigation extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  createAccordionForGroup: $PropertyType<Props, 'addressStores'> => Node = (stores) => {
    const { intl } = this.context;

    if (stores.length === 1 && stores[0].name.subgroup === AddressSubgroup.all) {
      const store = stores[0];
      return (
        <div className={styles.addressBook}>
          <button
            onClick={store.setAsActiveStore}
            type="button"
            className={classNames([
              store.name.subgroup,
              store.name.group,
              styles.filterButton,
              ...(store.isActiveStore ? [styles.active] : [])
            ])}
          >
            <div>
              {intl.formatMessage(addressGroupName[stores[0].name.group])}
              <Tooltip
                className={styles.Tooltip}
                skin={TooltipSkin}
                tip={intl.formatMessage(addressGroupsTooltip[stores[0].name.group])}
              >
                <span className={styles.infoIcon}>
                  <InfoIcon />
                </span>
              </Tooltip>
            </div>
          </button>
        </div>
      );
    }

    return (
      <Accordion
        showSpinner={stores.find(store => !store.wasExecuted) != null}
        header={
          <div>
            {intl.formatMessage(addressGroupName[stores[0].name.group])}
            <Tooltip
              className={styles.Tooltip}
              skin={TooltipSkin}
              tip={intl.formatMessage(addressGroupsTooltip[stores[0].name.group])}
            >
              <span className={styles.infoIcon}>
                <InfoIcon />
              </span>
            </Tooltip>
          </div>
        }
        activeHeader={stores.some(address => address.isActiveStore)}
      >
        {stores.map(type => (
          !type.isHidden && <ReceiveNavButton
            key={type.name.subgroup}
            className={classNames([type.name.subgroup, type.name.group])}
            icon={
              type.name.subgroup === AddressSubgroup.internal ||
              type.name.subgroup === AddressSubgroup.mangled
                ? AttentionIcon
                : undefined
            }
            label={intl.formatMessage(addressSubgroupName[type.name.subgroup])}
            isActive={type.isActiveStore}
            onClick={type.setAsActiveStore}
          />
        ))}
      </Accordion>
    );
  }

  createAccordions: void => Node = () => {
    // we use an array instead of a map to maintain the order of stores
    const groups: Array<$PropertyType<Props, 'addressStores'>> = [];

    for (const store of this.props.addressStores) {
      const existingGroup = groups.find(
        // if any existing group shares the group name
        group => group[0].name.group === store.name.group
      );
      if (existingGroup == null) {
        groups.push([store]);
        continue;
      }
      existingGroup.push(store);
    }

    return groups.map(group => (
      <div
        key={group[0].name.group}
        className={styles.accordion}
      >
        {this.createAccordionForGroup(group)}
      </div>
    ));
  }

  generateFilterSection: void => ?Node = () => {
    const { intl } = this.context;

    const { activeFilter } = this.props;
    const componentClasses = classNames([
      styles.filterButton,
      styles.active,
    ]);

    const activeStore = this.props.addressStores.find(store => store.isActiveStore);
    if (activeStore == null) return undefined;

    return (
      <div className={styles.filterSection}>
        {activeStore.validFilters.map(filter => (
          <button
            key={intl.formatMessage(addressFilter[filter])}
            type="button"
            onClick={() => this.props.setFilter(filter)}
            className={activeFilter === filter
              ? componentClasses
              : styles.filterButton
            }
          >
            {intl.formatMessage(addressFilter[filter])}
          </button>
        ))}
      </div>
    );
  }

  render(): Node {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.accordions}>
            {this.createAccordions()}
          </div>
          {/* Section filtered button */}
          {this.generateFilterSection()}
        </div>
      </div>
    );
  }
}

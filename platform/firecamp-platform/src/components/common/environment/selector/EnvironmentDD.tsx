import { FC, useState, useMemo, useEffect, memo } from 'react';
import isEqual from 'react-fast-compare';
import cx from 'classnames';
import shallow from 'zustand/shallow';
import { Button, DropdownMenu } from '@firecamp/ui';
import { TId } from '@firecamp/types';
import Helper from './Helper';
import { useEnvStore } from '../../../../store/environment';
import platformContext from '../../../../services/platform-context';

const EnvironmentDD: FC<IEnvironmentDD> = ({ onChange = () => {} }) => {
  const { environments, activeEnvId } = useEnvStore(
    (s) => ({
      environments: s.environments,
      activeEnvId: s.activeEnvId,
    }),
    shallow
  );
  const { createEnvironmentPrompt } = platformContext.platform;
  useEffect(() => {
    // console.log('env selector rendering the first time');
  }, []);
  const [isOpen, toggleOpen] = useState(false);
  const menu = useMemo(
    () => Helper.generate.environmentsDD(environments, activeEnvId),
    [environments, activeEnvId]
  );
  // console.log(menu, 778899);

  const _onSelectEnv = (env: { id: string }) => {
    console.log({ env });
    if (env === menu.selected) return;
    if (env.id == 'fc-new-environment') {
      createEnvironmentPrompt();
    } else {
      onChange(env.id);
    }
  };

  const options = [
    {
      name: 'Select Environment',
      isLabel: true,
    },
    ...[
      ...menu.options.slice(0, -1),
      {
        ...menu.options.at(-1),
        showSeparator: true,
      },
    ],
    { id: 'fc-new-environment', name: 'Create New Environment' },
  ];

  if (!menu?.selected) return <></>;
  const title = `${menu.selected.name}`;

  return (
    <DropdownMenu
      onOpenChange={(v) => toggleOpen(v)}
      handleRenderer={() => (
        <Button
          text={title}
          className={cx('!text-info', {
            open: isOpen,
          })}
          withCaret
          transparent
          ghost
          xs
        />
      )}
      selected={menu?.selected?.name || ''}
      options={options}
      onSelect={_onSelectEnv}
      classNames={{
        dropdown: '!pt-0',
        label: 'uppercase font-sans',
        item: '!px-5',
      }}
      sm
    />
  );
};
export default memo(EnvironmentDD, (n, p) => !isEqual(n, p));

interface IEnvironmentDD {
  onChange: (envId: TId) => void;
}

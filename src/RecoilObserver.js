import { useEffect } from 'react';
import { useRecoilSnapshot } from 'recoil';
import Logger from './Logger';

const log = new Logger('RecoilObserver');

const RecoilObserver = () => {
  const snapshot = useRecoilSnapshot();

  useEffect(() => {
    const modifiedAtoms = [...snapshot.getNodes_UNSTABLE({ isModified: true })];
    if (modifiedAtoms.length) {
      const updates = modifiedAtoms
        .map((node) => ({ key: node.key, val: snapshot.getLoadable(node).contents }))
        .reduce((map, obj) => {
          map[obj.key] = obj.val;
          return map;
        }, {});
      log.debug(updates);
    }
  }, [snapshot]);

  return null;
};

export default RecoilObserver;

import Directory from './directory';

export default interface Directories {
  sourceLayoutDirectory: Directory;
  sourcePagesDirectory: Directory;
  sourceMediaDirectory: Directory;
  publicPagesDirectory: Directory;
  publicMediaDirectory: Directory;
  publicCacheDirectory: Directory;
  publicAssetsDirectory: Directory;
}

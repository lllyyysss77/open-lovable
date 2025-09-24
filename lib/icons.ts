// Centralized icon exports to avoid Turbopack chunk loading issues
// This file pre-loads all icons to prevent dynamic import errors

export { 
  FiFile, 
  FiChevronRight, 
  FiChevronDown,
  FiGithub,
  FiSettings
} from 'react-icons/fi';

export { 
  BsFolderFill, 
  BsFolder2Open 
} from 'react-icons/bs';

export { 
  SiJavascript, 
  SiReact, 
  SiCss3, 
  SiJson 
} from 'react-icons/si';
// Re-export Settings as an alias for FiSettings for convenience
export { FiSettings as Settings } from 'react-icons/fi';
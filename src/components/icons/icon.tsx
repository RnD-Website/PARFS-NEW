import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Call02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  CreditCardIcon,
  CustomerSupportIcon,
  DashboardSquare01Icon,
  Delete02Icon,
  DeliveryTruck01Icon,
  Edit02Icon,
  EyeIcon,
  FavouriteIcon,
  FilterHorizontalIcon,
  GiftIcon,
  GitCompareIcon,
  GridViewIcon,
  Home01Icon,
  Image01Icon,
  InformationCircleIcon,
  Loading03Icon,
  Location01Icon,
  LockIcon,
  Logout01Icon,
  Mail01Icon,
  Menu01Icon,
  Mic01Icon,
  MinusSignIcon,
  Notification01Icon,
  PackageIcon,
  ReturnRequestIcon,
  RulerIcon,
  Search01Icon,
  Sent02Icon,
  ShoppingBag02Icon,
  SparklesIcon,
  StarIcon,
  Store01Icon,
  Tick02Icon,
  UserIcon,
  ViewOffIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";

/**
 * Icon set = Hugeicons "Stroke Rounded" — the same family used in the Figma file.
 * Refer to icons by name so components never import icon packages directly.
 */
const icons = {
  add: Add01Icon,
  alert: AlertCircleIcon,
  "arrow-down": ArrowDown01Icon,
  "arrow-up": ArrowUp01Icon,
  "chevron-left": ArrowLeft01Icon,
  "chevron-right": ArrowRight01Icon,
  "arrow-left": ArrowLeft02Icon,
  "arrow-right": ArrowRight02Icon,
  "arrow-up-right": ArrowUpRight01Icon,
  bag: ShoppingBag02Icon,
  bell: Notification01Icon,
  call: Call02Icon,
  card: CreditCardIcon,
  check: Tick02Icon,
  "check-circle": CheckmarkCircle02Icon,
  close: Cancel01Icon,
  compare: GitCompareIcon,
  dashboard: DashboardSquare01Icon,
  edit: Edit02Icon,
  eye: EyeIcon,
  "eye-off": ViewOffIcon,
  filter: FilterHorizontalIcon,
  gift: GiftIcon,
  grid: GridViewIcon,
  heart: FavouriteIcon,
  home: Home01Icon,
  image: Image01Icon,
  info: InformationCircleIcon,
  loading: Loading03Icon,
  location: Location01Icon,
  lock: LockIcon,
  logout: Logout01Icon,
  mail: Mail01Icon,
  menu: Menu01Icon,
  mic: Mic01Icon,
  minus: MinusSignIcon,
  package: PackageIcon,
  return: ReturnRequestIcon,
  ruler: RulerIcon,
  search: Search01Icon,
  send: Sent02Icon,
  sparkles: SparklesIcon,
  star: StarIcon,
  store: Store01Icon,
  support: CustomerSupportIcon,
  trash: Delete02Icon,
  truck: DeliveryTruck01Icon,
  user: UserIcon,
  wallet: Wallet01Icon,
} as const;

export type IconName = keyof typeof icons;

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.5,
  className,
  filled,
  label,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** Fills the shape with currentColor (used for rating stars and active wishlist hearts). */
  filled?: boolean;
  /** Accessible label. Without it the icon is decorative and hidden from screen readers. */
  label?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icons[name]}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      fill={filled ? "currentColor" : "none"}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}

import { cn } from '@/lib/utils';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Fragment } from 'react';
import {Link} from "@/i18n/routing"

type BaseMenuItem = {
  label: string;
  shortcut?: string;
  className?: string;
};

type ActionMenuItem = BaseMenuItem & {
  type: 'action';
  onClick: () => void;
};

type LinkMenuItem = BaseMenuItem & {
  type: 'link';
  href: string;
};

type MenuItem = ActionMenuItem | LinkMenuItem;

interface MenuButtonProps {
  items: MenuItem[];
  triggerLabel: React.ReactNode;
  withSeparators?: boolean;
  className?: string;
}

const MenuButton = ({
  items,
  triggerLabel,
  withSeparators = false,
  className,
}: MenuButtonProps) => {
  const renderMenuItem = (item: MenuItem, index: number) => {
    const commonContent = (
      <>
        {item.label}
        {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
      </>
    );

    return (
      <Fragment key={`${item.label}-${index}`}>
        <MenubarItem
          className={cn(item.className)}
          onClick={item.type === 'action' ? item.onClick : undefined}
          asChild={item.type === 'link'}
        >
          {item.type === 'link' ? (
            <Link href={item.href}>{commonContent}</Link>
          ) : (
            commonContent
          )}
        </MenubarItem>
        {withSeparators && index < items.length - 1 && <MenubarSeparator />}
      </Fragment>
    );
  };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger className={cn(className)}>
          {triggerLabel}
        </MenubarTrigger>
        <MenubarContent>
          {items.map((item, index) => renderMenuItem(item, index))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default MenuButton;

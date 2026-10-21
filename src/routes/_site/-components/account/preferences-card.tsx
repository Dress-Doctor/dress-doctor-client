import {
  Field,
  HStack,
  Icon,
  SegmentGroup,
  Stack,
  Switch,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useBlocker } from '@tanstack/react-router'
import { useId, useState } from 'react'
import SiteButton from '#/components/site/site-button'
import { inputProps } from '#/components/site/site-modals/modal-field'
import icons from '#/config/icons'
import { accountErrorText } from '#/data/account.data'
import { useUpdateProfile } from '#/hooks/use-update-profile'
import type { LanguageDto, MyProfileDto } from '#/interfaces/account.dto'
import { ADDRESS_MAX, draftFromProfile, profileChanges } from '#/libs/account'
import type { ProfileDraftDto } from '#/libs/account'
import { accountErrorFrom } from '#/libs/account-errors'
import type { AccountErrorKindDto } from '#/libs/account-errors'
import { m } from '#/paraglide/messages'
import ConfirmDialog from './confirm-dialog'
import DashboardCard from './dashboard-card'

/** What the form says about the last save: nothing, it worked, or why it did not. */
type Outcome = 'idle' | 'saved' | 'unchanged' | AccountErrorKindDto

/**
 * The few things a customer can change about themselves: the language we
 * write to them in, whether we message them, and the address we collect from.
 *
 * It keeps its own copy of the answers and compares it with the saved profile,
 * so "Save" lights up only when something differs, and sends only what
 * changed. If the customer leaves with unsaved changes, they are asked first.
 */
function PreferencesCard({ profile }: { profile: MyProfileDto }) {
  const languageLabelId = useId()
  const update = useUpdateProfile(profile.customerCode)

  const [draft, setDraft] = useState<ProfileDraftDto>(() =>
    draftFromProfile(profile),
  )
  const [outcome, setOutcome] = useState<Outcome>('idle')

  const changes = profileChanges(profile, draft)
  const dirty = changes !== undefined

  // Leaving with unsaved answers asks first. The browser asks too, for a tab
  // that is closed or reloaded.
  const blocker = useBlocker({
    shouldBlockFn: () => dirty && !update.isPending,
    enableBeforeUnload: () => dirty,
    withResolver: true,
  })

  const failed =
    outcome !== 'idle' && outcome !== 'saved' && outcome !== 'unchanged'
  const message =
    outcome === 'idle'
      ? undefined
      : outcome === 'saved'
        ? m.account_prefs_saved()
        : outcome === 'unchanged'
          ? m.account_prefs_unchanged()
          : accountErrorText[outcome]()

  const change = (next: Partial<ProfileDraftDto>) => {
    setDraft((current) => ({ ...current, ...next }))
    setOutcome('idle')
  }

  const save = () => {
    // Pressed with nothing to send: say so, so the press is not met with silence.
    if (!changes) {
      setOutcome('unchanged')
      return
    }
    update.mutate(changes, {
      onSuccess: () => setOutcome('saved'),
      onError: (error) => setOutcome(accountErrorFrom(error)),
    })
  }

  const undo = () => {
    setDraft(draftFromProfile(profile))
    setOutcome('idle')
  }

  return (
    <DashboardCard title={m.account_prefs_title()}>
      <Stack
        as="form"
        gap={6}
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
      >
        <Stack gap={2}>
          <Text
            id={languageLabelId}
            fontSize="13px"
            fontWeight="semibold"
            color="site.ink"
          >
            {m.account_prefs_language_label()}
          </Text>
          <SegmentGroup.Root
            aria-labelledby={languageLabelId}
            name="preferredLanguage"
            size="lg"
            rounded="14px"
            p="4px"
            bg="site.sunken"
            w={{ base: 'full', sm: 'fit-content' }}
            value={draft.preferredLanguage}
            disabled={update.isPending}
            colorPalette="turquoise-blue"
            onValueChange={(event) =>
              change({ preferredLanguage: event.value as LanguageDto })
            }
          >
            <SegmentGroup.Indicator rounded="11px" bg="white" shadow="sm" />
            <SegmentGroup.Items
              items={[
                { value: 'en', label: m.account_prefs_language_en() },
                { value: 'fr', label: m.account_prefs_language_fr() },
              ]}
              flex={{ base: '1', sm: 'none' }}
              minW="7rem"
              justifyContent="center"
              fontWeight="semibold"
              fontSize="15px"
              cursor="pointer"
            />
          </SegmentGroup.Root>
          <Text fontSize="12.5px" color="site.ink-muted">
            {m.account_prefs_language_hint()}
          </Text>
        </Stack>

        <Switch.Root
          colorPalette="turquoise-blue"
          alignItems="flex-start"
          gap={3}
          checked={draft.notificationsOptIn}
          disabled={update.isPending}
          onCheckedChange={(event) =>
            change({ notificationsOptIn: event.checked })
          }
        >
          <Switch.HiddenInput name="notificationsOptIn" />
          <Switch.Control mt="2px">
            <Switch.Thumb />
          </Switch.Control>
          <Stack gap={0.5}>
            <Switch.Label
              fontSize="15px"
              fontWeight="semibold"
              color="site.ink"
            >
              {m.account_prefs_notify_label()}
            </Switch.Label>
            <Text fontSize="12.5px" color="site.ink-muted">
              {m.account_prefs_notify_hint()}
            </Text>
          </Stack>
        </Switch.Root>

        <Field.Root gap={1.5} disabled={update.isPending}>
          <Field.Label fontSize="13px" fontWeight="semibold" color="site.ink">
            {m.account_prefs_address_label()}
          </Field.Label>
          <Textarea
            {...inputProps}
            name="pickupAddress"
            autoComplete="street-address"
            rows={3}
            maxLength={ADDRESS_MAX}
            value={draft.pickupAddress}
            placeholder={m.account_prefs_address_placeholder()}
            onChange={(event) => change({ pickupAddress: event.target.value })}
          />
          <Field.HelperText fontSize="12.5px" color="site.ink-muted">
            {m.account_prefs_address_hint()}
          </Field.HelperText>
        </Field.Root>

        <Stack gap={3}>
          <HStack gap={3} wrap="wrap">
            <SiteButton
              type="submit"
              px={6}
              py="12px"
              fontSize="15px"
              loading={update.isPending}
              loadingText={m.account_prefs_saving()}
            >
              {m.account_prefs_save()}
            </SiteButton>

            {dirty && !update.isPending && (
              <SiteButton
                type="button"
                variant="glass"
                px={5}
                py="12px"
                fontSize="15px"
                onClick={undo}
              >
                {m.account_prefs_undo()}
              </SiteButton>
            )}
          </HStack>

          {/* Read out when it appears, so it is heard as well as seen. */}
          <Text
            role={failed ? 'alert' : 'status'}
            fontSize="13.5px"
            color={
              failed
                ? 'red.600'
                : outcome === 'saved'
                  ? 'green.700'
                  : 'site.ink-muted'
            }
            hidden={outcome === 'idle'}
          >
            {outcome === 'saved' && (
              <Icon
                aria-hidden
                boxSize={4}
                me={1.5}
                verticalAlign="-3px"
                as={icons.check}
              />
            )}
            {message}
          </Text>
        </Stack>
      </Stack>

      <ConfirmDialog
        open={blocker.status === 'blocked'}
        title={m.account_prefs_leave_title()}
        body={m.account_prefs_leave_body()}
        confirmLabel={m.account_prefs_leave_confirm()}
        keepLabel={m.account_prefs_leave_keep()}
        destructive
        onConfirm={() => blocker.proceed?.()}
        onClose={() => blocker.reset?.()}
      />
    </DashboardCard>
  )
}

export default PreferencesCard

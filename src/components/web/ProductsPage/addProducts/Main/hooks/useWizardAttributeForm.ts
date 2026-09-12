import { useCallback, useEffect, useMemo } from 'react';
import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { buildSectionsWithDisplay } from '@/lib/listing-attributes/attribute-display/attribute-display';
import {
  flattenActiveAttributes,
  validateAttributeMap,
  withBooleanDefaults,
} from '@/lib/listing-attributes/attribute-validator/attribute-validator';
import { buildChildrenByParentId, type ReferenceCandidate } from '@/lib/listing-attributes/reference-chain/reference-chain';
import type {
  AttributeErrorMap,
  AttributeFormValue,
  ReferenceMetadataMap,
  ReferenceSnapshot,
  SectionWithDisplay,
} from '@/lib/listing-attributes/types/attribute-form.types';
import { useListingWizard } from '../context/listing-wizard.context';

/**
 * The schema-driven view of the attribute form shared by every section step and
 * the submit hook, so visibility / required / errors are computed once, over the
 * WHOLE form (a `conditionallyRequiredWhen` parent may live on another step).
 */
export const useWizardAttributeForm = () => {
  const { state, dispatch, schema } = useListingWizard();
  const { attributeValues, referenceSnapshots, proposals } = state;

  const allAttributes = useMemo<FormAttributeDto[]>(
    () => (schema ? flattenActiveAttributes(schema.sections.filter((s) => s.isActive !== false)) : []),
    [schema],
  );

  const childrenByParentId = useMemo(() => buildChildrenByParentId(allAttributes), [allAttributes]);

  const referenceMetadata = useMemo<ReferenceMetadataMap>(() => {
    const map: ReferenceMetadataMap = {};
    for (const [id, snap] of Object.entries(referenceSnapshots)) map[Number(id)] = snap?.metadata ?? null;
    return map;
  }, [referenceSnapshots]);

  const sections = useMemo<SectionWithDisplay[]>(
    () => (schema ? buildSectionsWithDisplay(schema.sections, attributeValues, referenceMetadata, proposals) : []),
    [schema, attributeValues, referenceMetadata, proposals],
  );

  // An untouched boolean is "no": seed it so a required boolean cannot block submission.
  useEffect(() => {
    const ids = allAttributes.filter((a) => a.type === 'boolean').map((a) => a.id);
    if (ids.length > 0) dispatch({ type: 'seedBooleanDefaults', attributeIds: ids });
  }, [allAttributes, dispatch]);

  const errors = useMemo<AttributeErrorMap>(
    () =>
      schema
        ? validateAttributeMap(schema.sections, withBooleanDefaults(allAttributes, attributeValues), referenceMetadata, proposals)
        : {},
    [schema, allAttributes, attributeValues, referenceMetadata, proposals],
  );

  const setValue = useCallback(
    (attributeId: number, value: AttributeFormValue) =>
      dispatch({ type: 'setAttributeValue', attributeId, value, childrenByParentId }),
    [dispatch, childrenByParentId],
  );

  const setSnapshot = useCallback(
    (attributeId: number, snapshot: ReferenceSnapshot | null) => dispatch({ type: 'setReferenceSnapshot', attributeId, snapshot }),
    [dispatch],
  );

  const setProposal = useCallback(
    (attributeId: number, name: string) => dispatch({ type: 'setProposal', attributeId, name, childrenByParentId }),
    [dispatch, childrenByParentId],
  );

  const clearProposal = useCallback((attributeId: number) => dispatch({ type: 'clearProposal', attributeId }), [dispatch]);

  const pickCandidate = useCallback(
    (attributeId: number, candidate: ReferenceCandidate) => {
      const attr = allAttributes.find((a) => a.id === attributeId);
      dispatch({
        type: 'pickReferenceCandidate',
        attributeId,
        candidate,
        parentAttributeId: attr?.dependsOnAttributeId ?? null,
        childrenByParentId,
      });
    },
    [allAttributes, childrenByParentId, dispatch],
  );

  return {
    schema,
    allAttributes,
    sections,
    childrenByParentId,
    referenceMetadata,
    errors,
    attributeValues,
    referenceSnapshots,
    proposals,
    setValue,
    setSnapshot,
    setProposal,
    clearProposal,
    pickCandidate,
  };
};
